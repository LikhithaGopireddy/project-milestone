// optional versioning
def version = "0.${env.BUILD_NUMBER}"

pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        // checkout repo
        git "https://github.com/LikhithaGopireddy/project-milestone.git"

        // install and build
        sh 'npm ci'
        sh 'npm run build'
      }
    }

    stage('Test / Lint') {
      steps {
        // lint step (won't fail pipeline because of "|| true")
        sh 'npm run lint || true'
      }
    }

    stage('Deploy') {
      steps {
        script {
          // stop & remove all containers (ignore error if none)
          sh 'docker rm -f $(docker ps -aq) || true'

          // remove all images (ignore error if none) — be careful on shared agents
          sh 'docker rmi -f $(docker images -aq) || true'

          // build image with version tag
          sh "docker build -t my-pictogram-appp:${version} ."

          // run container mapping host port 80 -> container 3000
          sh "docker run -d -p 80:3000 --name pictogram my-pictogram-appp:${version}"
        }
      }
    }
  }

  post {
    success {
      echo "🎉 Deployment successful — pictogram running (image: my-pictogram-appp:${version})"
    }
    failure {
      echo "❌ Pipeline failed — check logs."
    }
    always {
      echo "Pipeline finished for build ${env.BUILD_NUMBER}"
    }
  }
}
