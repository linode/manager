node {
    timeout(time: 60, unit: 'MINUTES') {
        try {
            stage('Checkout') {
                dir('manager')
                checkout scm
            }
            stage('E2E Tests') {
                withCredentials([usernamePassword(credentialsId: 'manager-test-user', passwordVariable: 'MANAGER_PASS', usernameVariable: 'MANAGER_USER')]) {
                    sh returnStatus: true, script: '''export REACT_APP_LOGIN_ROOT=https://login.dev.linode.com
                    export REACT_APP_CLIENT_ID=39aeb26e92e9338aafd5
                    export REACT_APP_API_ROOT=https://api.dev.linode.com/v4
                    docker-compose -f integration-test.yml up --build --exit-code-from manager-e2e
                    docker-compose -f integration-test.yml down'''
                }
            }
        } catch (err) {
            currentBuild.result = 'FAILED'
        }
    }
}