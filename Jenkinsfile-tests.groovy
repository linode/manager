pipeline {
    agent {
        label 'docker'
    }
    environment {
        REACT_APP_LOGIN_ROOT = 'ADD CREDENTIALS HERE'
        REACT_APP_CLIENT_ID = 'ADD CREDENTIALS HERE'
        REACT_APP_API_ROOT = 'ADD CREDENTIALS HERE'
        REACT_APP_APP_ROOT = 'ADD CREDENTIALS HERE'
        MANAGER_OAUTH_1 = 'ADD CREDENTIALS HERE'
        REACT_APP_LAUNCH_DARKLY_ID = 'ADD CREDENTIALS HERE'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/jdamore-linode/manager',
                    branch: "${env.BRANCH_NAME}"
            }
        }
        stage('Build') {
            agent {
                docker {
                    image 'node:16-alpine3.15'
                    reuseNode true
                }
            }
            steps {
                sh 'yarn install:all'
                sh 'yarn build'
            }
        }
        stage('Test') {
            steps {
                // For now, '.env' file must exist (but it can be blank).
                // We'll fix this on Cloud Manager's side then remove this.
                sh 'touch ./packages/manager/.env'
                sh 'docker compose build'
                sh 'docker compose up --exit-code-from e2e e2e'
            }
        }
    }
    post {
      always {
        sh 'docker compose stop'
        cleanWs()
      }
    }
}
