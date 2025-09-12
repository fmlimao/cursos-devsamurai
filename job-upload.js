const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// Configuração do Google Cloud Storage
const storage = new Storage({
  keyFilename: './gcp-credentials.json',
  projectId: 'testes-e1f0b'
});

// Nome do bucket
const BUCKET_NAME = 'curso-devsamurai-bucket';
const RAW_FOLDER = './raw';
const DB_FILE = './db.json';

// Extensões de vídeo suportadas
const VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.m4v'];

async function scanCourses() {
  console.log('🔍 Escaneando pasta de cursos...');

  if (!fs.existsSync(RAW_FOLDER)) {
    throw new Error(`Pasta ${RAW_FOLDER} não encontrada!`);
  }

  const courses = [];
  const courseFolders = fs.readdirSync(RAW_FOLDER, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const courseName of courseFolders) {
    const coursePath = path.join(RAW_FOLDER, courseName);
    const videos = [];

    console.log(`📚 Processando curso: ${courseName}`);

    // Escaneia arquivos de vídeo na pasta do curso
    const files = fs.readdirSync(coursePath);
    for (const fileName of files) {
      const filePath = path.join(coursePath, fileName);
      const ext = path.extname(fileName).toLowerCase();

      if (fs.statSync(filePath).isFile() && VIDEO_EXTENSIONS.includes(ext)) {
        videos.push({
          name: fileName,
          localPath: filePath,
          bucketPath: `${courseName}/${fileName}`,
          extension: ext
        });
      }
    }

    if (videos.length > 0) {
      courses.push({
        name: courseName,
        videos: videos,
        totalVideos: videos.length
      });
      console.log(`   ✅ Encontrados ${videos.length} vídeo(s)`);
    } else {
      console.log(`   ⚠️  Nenhum vídeo encontrado`);
    }
  }

  console.log(`\n📊 Total: ${courses.length} curso(s) encontrado(s)`);
  return courses;
}

async function uploadVideo(video, courseName) {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(video.bucketPath);

    // Verifica se o arquivo já existe no bucket
    const [exists] = await file.exists();

    if (exists) {
      console.log(`   ⏭️  ${video.name} já existe no bucket, pulando...`);
      return {
        success: true,
        skipped: true,
        publicUrl: `https://storage.googleapis.com/${BUCKET_NAME}/${video.bucketPath}`
      };
    }

    // Faz o upload do vídeo
    const fileSize = fs.statSync(video.localPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
    console.log(`   📤 Enviando ${video.name} (${fileSizeMB} MB)...`);
    
    await bucket.upload(video.localPath, {
      destination: video.bucketPath,
      metadata: {
        cacheControl: 'public, max-age=31536000',
        contentType: getVideoContentType(video.extension)
      },
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${video.bucketPath}`;
    console.log(`   ✅ ${video.name} enviado com sucesso! (${fileSizeMB} MB)`);

    return {
      success: true,
      skipped: false,
      publicUrl: publicUrl
    };

  } catch (error) {
    console.error(`   ❌ Erro ao enviar ${video.name}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function getVideoContentType(extension) {
  const contentTypes = {
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.m4v': 'video/x-m4v'
  };
  return contentTypes[extension] || 'video/mp4';
}

async function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('⚠️  Erro ao carregar banco de dados, criando novo...');
  }

  return { cursos: [] };
}

async function saveDatabase(database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
    console.log('💾 Banco de dados atualizado!');
  } catch (error) {
    console.error('❌ Erro ao salvar banco de dados:', error.message);
  }
}

async function updateDatabase(courses, uploadResults) {
  console.log('\n📝 Atualizando banco de dados...');

  const database = await loadDatabase();

  for (const course of courses) {
    // Procura se o curso já existe no banco
    let existingCourse = database.cursos.find(c => c.nome === course.name);

    if (!existingCourse) {
      // Cria novo curso
      existingCourse = {
        nome: course.name,
        aulas: []
      };
      database.cursos.push(existingCourse);
      console.log(`   📚 Novo curso adicionado: ${course.name}`);
    }

    // Atualiza as aulas do curso
    for (let i = 0; i < course.videos.length; i++) {
      const video = course.videos[i];
      const result = uploadResults[course.name][i];

      if (result.success) {
        // Procura se a aula já existe
        let existingAula = existingCourse.aulas.find(a => a.nome === video.name);

        if (!existingAula) {
          // Cria nova aula
          existingAula = {
            nome: video.name,
            url: result.publicUrl,
            tamanho: fs.statSync(video.localPath).size,
            extensao: video.extension,
            dataUpload: new Date().toISOString()
          };
          existingCourse.aulas.push(existingAula);
          console.log(`     📹 Nova aula adicionada: ${video.name}`);
        } else {
          // Atualiza URL se mudou
          if (existingAula.url !== result.publicUrl) {
            existingAula.url = result.publicUrl;
            existingAula.dataUpload = new Date().toISOString();
            console.log(`     🔄 Aula atualizada: ${video.name}`);
          }
        }
      }
    }
  }

  await saveDatabase(database);
  return database;
}

async function checkBucketAccess() {
  try {
    console.log(`🔍 Verificando acesso ao bucket ${BUCKET_NAME}...`);
    const bucket = storage.bucket(BUCKET_NAME);
    await bucket.getFiles({ maxResults: 1 });
    console.log(`✅ Acesso ao bucket ${BUCKET_NAME} confirmado!`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao acessar bucket:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🎯 Iniciando job de upload de cursos para Google Cloud Storage...\n');

    // 1. Verificar acesso ao bucket
    const hasAccess = await checkBucketAccess();
    if (!hasAccess) {
      console.log('❌ Não foi possível acessar o bucket. Encerrando...');
      process.exit(1);
    }

    // 2. Escanear cursos
    const courses = await scanCourses();
    if (courses.length === 0) {
      console.log('❌ Nenhum curso encontrado!');
      return;
    }

    // 3. Fazer upload dos vídeos
    console.log('\n🚀 Iniciando upload dos vídeos...');
    const uploadResults = {};

    // Calcula total de vídeos para progresso geral
    const totalVideos = courses.reduce((sum, course) => sum + course.totalVideos, 0);
    let processedVideos = 0;

    for (const course of courses) {
      console.log(`\n📚 Processando curso: ${course.name} (${course.totalVideos} vídeo(s))`);
      uploadResults[course.name] = [];

      for (let i = 0; i < course.videos.length; i++) {
        const video = course.videos[i];
        const result = await uploadVideo(video, course.name);
        uploadResults[course.name].push(result);
        
        // Atualiza contadores
        processedVideos++;
        const courseProgress = Math.round(((i + 1) / course.totalVideos) * 100);
        const overallProgress = Math.round((processedVideos / totalVideos) * 100);
        
        console.log(`   📊 Curso: ${courseProgress}% (${i + 1}/${course.totalVideos}) | Geral: ${overallProgress}% (${processedVideos}/${totalVideos})`);
      }
      
      console.log(`   ✅ Curso "${course.name}" concluído!`);
    }

    // 4. Atualizar banco de dados
    const database = await updateDatabase(courses, uploadResults);

    // 5. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log('═'.repeat(60));

    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalSizeUploaded = 0;

    for (const course of courses) {
      console.log(`\n📚 ${course.name} (${course.totalVideos} vídeo(s)):`);
      const results = uploadResults[course.name];
      let courseUploaded = 0;
      let courseSkipped = 0;
      let courseErrors = 0;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const video = course.videos[i];

        if (result.success) {
          if (result.skipped) {
            console.log(`   ⏭️  ${video.name} (já existia)`);
            totalSkipped++;
            courseSkipped++;
          } else {
            const fileSize = fs.statSync(video.localPath).size;
            const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
            console.log(`   ✅ ${video.name} (${fileSizeMB} MB)`);
            totalUploaded++;
            courseUploaded++;
            totalSizeUploaded += fileSize;
          }
        } else {
          console.log(`   ❌ ${video.name} (erro: ${result.error})`);
          totalErrors++;
          courseErrors++;
        }
      }

      // Resumo do curso
      console.log(`   📊 Curso: ${courseUploaded} enviados, ${courseSkipped} pulados, ${courseErrors} erros`);
    }

    console.log('\n📈 ESTATÍSTICAS GERAIS:');
    console.log('─'.repeat(40));
    console.log(`   ✅ Enviados: ${totalUploaded} vídeo(s)`);
    console.log(`   ⏭️  Pulados: ${totalSkipped} vídeo(s)`);
    console.log(`   ❌ Erros: ${totalErrors} vídeo(s)`);
    console.log(`   📚 Cursos processados: ${courses.length}`);
    console.log(`   📹 Total de vídeos: ${totalVideos}`);
    
    if (totalSizeUploaded > 0) {
      const totalSizeGB = (totalSizeUploaded / (1024 * 1024 * 1024)).toFixed(2);
      console.log(`   💾 Tamanho total enviado: ${totalSizeGB} GB`);
    }

    console.log('\n🎉 Job concluído com sucesso!');

  } catch (error) {
    console.error('💥 Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executa o job
if (require.main === module) {
  main();
}

module.exports = {
  scanCourses,
  uploadVideo,
  loadDatabase,
  saveDatabase,
  updateDatabase,
  checkBucketAccess
};