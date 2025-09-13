const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execFile } = require('child_process');

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

// Lista de cursos para baixar e processar
const COURSES_TO_FETCH = [
  // { name: 'Backend - Dominando o NodeJS', url: 'https://cursos.devsamurai.com.br/Backend%20-%20Dominando%20o%20NodeJS.zip' },
  // { name: 'Backend - Dominando o Postgres', url: 'https://cursos.devsamurai.com.br/Backend%20-%20Dominando%20o%20Postgres.zip' },
  // { name: 'Carreira de Programador', url: 'https://cursos.devsamurai.com.br/Carreira%20de%20Programador.zip' },
  // { name: 'Flutter - Calculadora IMC', url: 'https://cursos.devsamurai.com.br/Flutter%20-%20Calculadora%20IMC.zip' },
  // { name: 'Flutter - Cardápio online', url: 'https://cursos.devsamurai.com.br/Flutter%20-%20Card%C3%A1pio%20online.zip' },
  // { name: 'Flutter - Fluck Noris', url: 'https://cursos.devsamurai.com.br/Flutter%20-%20Fluck%20Noris.zip' },
  // { name: 'Flutter - Lista de Leituras', url: 'https://cursos.devsamurai.com.br/Flutter%20-%20Lista%20de%20Leituras.zip' },
  // { name: 'Flutter Avançado', url: 'https://cursos.devsamurai.com.br/Flutter%20Avan%C3%A7ado.zip' },
  // { name: 'Flutter Básico', url: 'https://cursos.devsamurai.com.br/Flutter%20B%C3%A1sico.zip' },
  // { name: 'Flutter Snippets', url: 'https://cursos.devsamurai.com.br/Flutter%20Snippets.zip' },
  // { name: 'Frontend - Bootstrap', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Bootstrap.zip' },
  // { name: 'Frontend - CSS Grid', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20CSS%20Grid.zip' },
  // { name: 'Frontend - Criando seu currículo', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Criando%20seu%20curr%C3%ADculo.zip' },
  // { name: 'Frontend - Criando seu portfólio', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Criando%20seu%20portf%C3%B3lio.zip' },
  // { name: 'Frontend - Curriculum HTML', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Curriculum%20HTML.zip' },
  // { name: 'Frontend - Entendo o HTML com o CSS', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Entendo%20o%20HTML%20com%20o%20CSS.zip' },
  // { name: 'Frontend - Flexbox', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Flexbox.zip' },
  // { name: 'Frontend - Formulário de Cadastro', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Formul%C3%A1rio%20de%20Cadastro.zip' },
  // { name: 'Frontend - HTML Básico', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20HTML%20B%C3%A1sico.zip' },
  // { name: 'Frontend - Loja de Café', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Loja%20de%20Caf%C3%A9.zip' },
  // { name: 'Frontend - Mobile First', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Mobile%20First.zip' },
  // { name: 'Frontend - Preprocessadores (Sass)', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Preprocessadores%20(Sass).zip' },
  // { name: 'Frontend - Sua primeira página Web', url: 'https://cursos.devsamurai.com.br/Frontend%20-%20Sua%20primeira%20p%C3%A1gina%20Web.zip' },
  // { name: 'Full Stack - Food Commerce', url: 'https://cursos.devsamurai.com.br/Full%20Stack%20-%20Food%20Commerce.zip' },
  // /**/{ name: 'Ionic', url: 'https://cursos.devsamurai.com.br/Ionic.zip' },
  // { name: 'JavaScript - Gerador Senhas', url: 'https://cursos.devsamurai.com.br/JavaScript%20-%20Gerador%20Senhas.zip' },
  // { name: 'JavaScript Básico ao Avançado', url: 'https://cursos.devsamurai.com.br/JavaScript%20B%C3%A1sico%20ao%20Avan%C3%A7ado.zip' },
  // { name: 'Kapi Academy - API Supreme', url: 'https://cursos.devsamurai.com.br/Kapi%20Academy%20-%20API%20Supreme.zip' },
  // { name: 'Linux para Programadores', url: 'https://cursos.devsamurai.com.br/Linux%20para%20Programadores.zip' },
  // { name: 'Lógica de Programação Avançada', url: 'https://cursos.devsamurai.com.br/L%C3%B3gica%20de%20Programa%C3%A7%C3%A3o%20Avan%C3%A7ada.zip' },
  // { name: 'Lógica de Programação Básica', url: 'https://cursos.devsamurai.com.br/L%C3%B3gica%20de%20Programa%C3%A7%C3%A3o%20B%C3%A1sica.zip' },
  // /**/{ name: 'Master Classes', url: 'https://cursos.devsamurai.com.br/Master%20Classes.zip' },
  // { name: 'Minha Primeira Oportunidade', url: 'https://cursos.devsamurai.com.br/Minha%20Primeira%20Oportunidade.zip' },
  // { name: 'Minicurso Programar do Zero', url: 'https://cursos.devsamurai.com.br/Minicurso%20Programar%20do%20Zero.zip' },
  // { name: 'Monitoria Aberta', url: 'https://cursos.devsamurai.com.br/Monitoria%20Aberta.zip' },
  // { name: 'Montando o ambiente Dev', url: 'https://cursos.devsamurai.com.br/Montando%20o%20ambiente%20Dev.zip' },
  // { name: 'Primeira Oportunidade', url: 'https://cursos.devsamurai.com.br/Primeira%20Oportunidade.zip' },
  // { name: 'Programar do Zero - HTML', url: 'https://cursos.devsamurai.com.br/Programar%20do%20Zero%20-%20HTML.zip' },
  // { name: 'Programar do Zero - Jokenpo', url: 'https://cursos.devsamurai.com.br/Programar%20do%20Zero%20-%20Jokenpo.zip' },
  // { name: 'Programar do Zero - Ping-Pong', url: 'https://cursos.devsamurai.com.br/Programar%20do%20Zero%20-%20Ping-Pong.zip' },
  // { name: 'Programar do Zero', url: 'https://cursos.devsamurai.com.br/Programar%20do%20Zero.zip' },
  // { name: 'Python - Forca', url: 'https://cursos.devsamurai.com.br/Python%20-%20Forca.zip' },
  // { name: 'Python - Jogo Adivinha', url: 'https://cursos.devsamurai.com.br/Python%20-%20Jogo%20Adivinha.zip' },
  // { name: 'Python - Jogo Cobrinha', url: 'https://cursos.devsamurai.com.br/Python%20-%20Jogo%20Cobrinha.zip' },
  // { name: 'Python - Juros Compostos', url: 'https://cursos.devsamurai.com.br/Python%20-%20Juros%20Compostos.zip' },
  // /**/{ name: 'Python - Tabela Fipe', url: 'https://cursos.devsamurai.com.br/Python%20-%20Tabela%20Fipe.zip' },
  // { name: 'Python Avançado', url: 'https://cursos.devsamurai.com.br/Python%20Avan%C3%A7ado.zip' },
  { name: 'Python Básico', url: 'https://cursos.devsamurai.com.br/Python%20B%C3%A1sico.zip' },
  // { name: 'React - API Github', url: 'https://cursos.devsamurai.com.br/React%20-%20API%20Github.zip' },
  // { name: 'React - Fundamentos', url: 'https://cursos.devsamurai.com.br/React%20-%20Fundamentos.zip' },
  // { name: 'React - Lista de Leitura', url: 'https://cursos.devsamurai.com.br/React%20-%20Lista%20de%20Leitura.zip' },
  // { name: 'React Native - Calculadora IMC', url: 'https://cursos.devsamurai.com.br/React%20Native%20-%20Calculadora%20IMC.zip' },
  // { name: 'React Native - Publicando o Aplicativo', url: 'https://cursos.devsamurai.com.br/React%20Native%20-%20Publicando%20o%20Aplicativo.zip' },
  // { name: 'React Native - Smart Money - Firebase', url: 'https://cursos.devsamurai.com.br/React%20Native%20-%20Smart%20Money%20-%20Firebase.zip' },
  // { name: 'React Native - Smart Money - Navigation V5', url: 'https://cursos.devsamurai.com.br/React%20Native%20-%20Smart%20Money%20-%20Navigation%20V5.zip' },
  // { name: 'React Native - SmartMoney - Login', url: 'https://cursos.devsamurai.com.br/React%20Native%20-%20SmartMoney%20-%20Login.zip' },
  // { name: 'React Native - SmartMoney', url: 'https://cursos.devsamurai.com.br/React%20Native%20-%20SmartMoney.zip' },
  // { name: 'React Native - TODO', url: 'https://cursos.devsamurai.com.br/React%20Native%20-%20TODO.zip' },
  // { name: 'React Native', url: 'https://cursos.devsamurai.com.br/React%20Native.zip' },
  // { name: 'Renda Extra 10x - Entrevistas', url: 'https://cursos.devsamurai.com.br/Renda%20Extra%2010x%20-%20Entrevistas.zip' },
  // { name: 'Renda Extra 10x - Mente Inabalável', url: 'https://cursos.devsamurai.com.br/Renda%20Extra%2010x%20-%20Mente%20Inabal..zip' },
  // { name: 'Renda Extra 10x - Precificação de Sistemas', url: 'https://cursos.devsamurai.com.br/Renda%20Extra%2010x%20-%20Precifica%C3%A7%C3%A3o%20de%20Sistemas.zip' },
  // { name: 'Renda Extra 10x - Treinamento extra', url: 'https://cursos.devsamurai.com.br/Renda%20Extra%2010x%20-%20Treinamento%20extra.zip' },
  // { name: 'Renda Extra 10x', url: 'https://cursos.devsamurai.com.br/Renda%20Extra%2010x.zip' },
  // { name: 'TypeScript - TODO List', url: 'https://cursos.devsamurai.com.br/TypeScript%20-%20TODO%20List.zip' },
  // { name: 'TypeScript Básico', url: 'https://cursos.devsamurai.com.br/TypeScript%20B%C3%A1sico.zip' }
];

function ensureRawFolder() {
  if (!fs.existsSync(RAW_FOLDER)) {
    fs.mkdirSync(RAW_FOLDER, { recursive: true });
    console.log(`📁 Pasta ${RAW_FOLDER} criada.`);
  }
}

function followRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const doRequest = (currentUrl, redirectsLeft) => {
      https.get(currentUrl, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft === 0) return reject(new Error('Muitos redirecionamentos'));
          const nextUrl = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, currentUrl).href;
          res.resume();
          doRequest(nextUrl, redirectsLeft - 1);
        } else if (res.statusCode === 200) {
          resolve(res);
        } else {
          reject(new Error(`Status HTTP ${res.statusCode}`));
        }
      }).on('error', reject);
    };
    doRequest(url, maxRedirects);
  });
}

async function downloadZip(url, destinationPath) {
  console.log(`⬇️  Baixando: ${url}`);
  return new Promise(async (resolve, reject) => {
    try {
      const res = await followRedirects(url);
      const total = parseInt(res.headers['content-length'] || '0', 10);
      let downloaded = 0;
      const fileStream = fs.createWriteStream(destinationPath);
      res.on('data', chunk => {
        downloaded += chunk.length;
        if (total) {
          const pct = Math.floor((downloaded / total) * 100);
          process.stdout.write(`   ⏬ Progresso: ${pct}%\r`);
        }
      });
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => {
          console.log(`   ✅ Download concluído: ${path.basename(destinationPath)}`);
          resolve(destinationPath);
        });
      });
      fileStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

async function unzipFile(zipPath, outputDir) {
  console.log(`🗜️  Descompactando: ${path.basename(zipPath)} ...`);
  return new Promise((resolve, reject) => {
    execFile('unzip', ['-o', zipPath, '-d', outputDir], (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      console.log('   ✅ Descompactado com sucesso');
      resolve();
    });
  });
}

function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Apagado arquivo: ${path.basename(filePath)}`);
    }
  } catch (e) {
    console.log(`⚠️  Não foi possível apagar arquivo: ${filePath}`);
  }
}

function removeDirectoryRecursive(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`🧹 Pasta removida: ${dirPath}`);
    }
  } catch (e) {
    console.log(`⚠️  Não foi possível remover pasta: ${dirPath}`);
  }
}

function collectVideosRecursively(baseDir, courseName) {
  const stack = [baseDir];
  const videos = [];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (VIDEO_EXTENSIONS.includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath);
          const bucketPath = relativePath ? `${courseName}/${relativePath}`.replace(/\\/g, '/') : `${courseName}/${entry.name}`;
          videos.push({
            name: entry.name,
            localPath: fullPath,
            bucketPath,
            extension: ext
          });
        }
      }
    }
  }
  return videos;
}

function buildCourseFromFolder(courseName) {
  const coursePath = path.join(RAW_FOLDER, courseName);
  if (!fs.existsSync(coursePath) || !fs.statSync(coursePath).isDirectory()) {
    return null;
  }
  const videos = collectVideosRecursively(coursePath, courseName);
  if (videos.length === 0) return null;
  return { name: courseName, videos, totalVideos: videos.length };
}

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
    console.log('🎯 Iniciando job de download, upload para GCS e atualização do DB...\n');

    // 1. Verificar acesso ao bucket
    const hasAccess = await checkBucketAccess();
    if (!hasAccess) {
      console.log('❌ Não foi possível acessar o bucket. Encerrando...');
      process.exit(1);
    }

    // 2. Garantir pasta raw
    ensureRawFolder();

    // 3. Carregar DB atual
    let database = await loadDatabase();

    // 4. Métricas gerais
    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalSizeUploaded = 0;
    let coursesProcessed = 0;
    let totalVideos = 0;

    // 5. Iterar lista de cursos para buscar
    for (const item of COURSES_TO_FETCH) {
      const courseName = item.name;

      // Se já existe no DB, pula tudo
      const alreadyInDb = database.cursos.some(c => c.nome === courseName);
      if (alreadyInDb) {
        console.log(`⏭️  Curso já presente no DB: ${courseName}. Pulando download e upload...`);
        continue;
      }

      console.log(`\n📥 Preparando download do curso: ${courseName}`);
      const zipName = `${courseName}.zip`;
      const zipPath = path.join(RAW_FOLDER, zipName);

      // Baixar ZIP se não existir
      if (!fs.existsSync(zipPath)) {
        try {
          await downloadZip(item.url, zipPath);
        } catch (err) {
          console.error(`   ❌ Falha no download de ${courseName}: ${err.message}`);
          totalErrors++;
          continue;
        }
      } else {
        console.log('   ⏭️  ZIP já existe localmente, pulando download...');
      }

      // Descompactar
      try {
        await unzipFile(zipPath, RAW_FOLDER);
      } catch (err) {
        console.error(`   ❌ Falha ao descompactar ${zipName}: ${err.message}`);
        totalErrors++;
        // tenta apagar zip mesmo assim
        removeFile(zipPath);
        continue;
      }

      // Apagar zip
      removeFile(zipPath);

      // Montar curso a partir da pasta
      const course = buildCourseFromFolder(courseName);
      if (!course) {
        console.log(`   ⚠️  Não foi possível localizar vídeos para ${courseName}. Pulando...`);
        // Tenta remover pasta com o nome do curso caso exista
        removeDirectoryRecursive(path.join(RAW_FOLDER, courseName));
        continue;
      }

      console.log(`\n🚀 Iniciando upload dos vídeos do curso: ${course.name} (${course.totalVideos} vídeo(s))`);

      totalVideos += course.totalVideos;
      for (let i = 0; i < course.videos.length; i++) {
        const video = course.videos[i];
        const result = await uploadVideo(video, course.name);

        if (result.success) {
          if (result.skipped) {
            totalSkipped++;
          } else {
            const fileSize = fs.statSync(video.localPath).size;
            totalUploaded++;
            totalSizeUploaded += fileSize;
          }
        } else {
          totalErrors++;
        }

        // Atualiza o DB imediatamente para esta aula
        const partialCourse = { name: course.name, videos: [video], totalVideos: 1 };
        const partialResults = { [course.name]: [result] };
        database = await updateDatabase([partialCourse], partialResults);

        const courseProgress = Math.round(((i + 1) / course.totalVideos) * 100);
        console.log(`   📊 Curso: ${courseProgress}% (${i + 1}/${course.totalVideos})`);
      }

      console.log(`   ✅ Curso "${course.name}" uploads concluídos!`);

      coursesProcessed++;

      // Limpar a pasta do curso
      removeDirectoryRecursive(path.join(RAW_FOLDER, course.name));
    }

    // 6. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log('═'.repeat(60));
    console.log(`   ✅ Enviados: ${totalUploaded} vídeo(s)`);
    console.log(`   ⏭️  Pulados: ${totalSkipped} vídeo(s)`);
    console.log(`   ❌ Erros: ${totalErrors} vídeo(s)`);
    console.log(`   📚 Cursos processados: ${coursesProcessed}`);
    console.log(`   📹 Total de vídeos considerados: ${totalVideos}`);
    if (totalSizeUploaded > 0) {
      const totalSizeGB = (totalSizeUploaded / (1024 * 1024 * 1024)).toFixed(2);
      console.log(`   💾 Tamanho total enviado: ${totalSizeGB} GB`);
    }

    console.log('\n🎉 Job concluído!');

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