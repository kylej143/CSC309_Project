# node and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install v22.11.0

node -v # should print `v22.11.0`
npm -v # should print `10.9.0`

# java
sudo apt install default-jre
sudo apt install default-jdk
java -version
javac --version

# python 3.10
sudo apt update
sudo apt install python3
python3 --version

# gcc and g++
sudo apt-get update
sudo apt install build-essential

npm i prisma @prisma/client @prisma/studio
npm i bcrypt
npm i jsonwebtoken
npm i sqlite3 --save
npm i sqlite --save
npx prisma generate
npx prisma migrate dev
node utils/add_admin.js
