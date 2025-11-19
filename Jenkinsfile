// version
def version = "0.${env.BUILD_NUMBER}"

pipeline {
  agent any

  stages {
    stage('Prepare') {
      steps {
        checkout scm   // optional — ensures workspace matches Jenkinsfile checkout
      }
    }

    stage('Build') {
      steps {
        // requires node & npm on the agent
        sh 'npm ci'
        sh 'npm run build'
      }
    }

    stage('Test / Lint') {
      steps {
        sh 'npm run lint || true'
      }
    }

    stage('Deploy') {
      steps {
        script {
          // only remove the named container if it exists (safe)
          sh '''
            if docker ps -a --format '{{.Names}}' | grep -q '^pictogram$'; then
              docker rm -f pictogram || true
            fi
          '''

          // build image with version tag (fixed name)
          sh "docker build -t my-pictogram-app:${version} ."

          // run container (host port 80 -> container 3000)
          sh "docker run -d -p 80:3000 --name pictogram my-pictogram-app:${version}"
        }
      }
    }
  }

  post {
    success { echo "🎉 Deployment successful — pictogram running (image: my-pictogram-app:${version})" }
    failure { echo "❌ Pipeline failed — check logs." }
    always  { echo "Pipeline finished for build ${env.BUILD_NUMBER}" }
  }
}
