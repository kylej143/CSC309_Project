# node and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install v22.11.0
source ~/.bashrc

npm i prisma @prisma/client @prisma/studio
npm i bcrypt
npm i jsonwebtoken
npm i sqlite3 --save
npm i sqlite --save
npm install react-syntax-highlighter --save
npx prisma generate
npx prisma migrate dev
node utils/add_admin.js
npm audit fix


echo nodejs:
node -v # should print `v22.11.0`
echo npm:
npm -v # should print `10.9.0`
