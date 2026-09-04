#!/bin/bash
clear
IP=$(wget -qO- ipv4.icanhazip.com)
[[ "$(whoami)" != "root" ]] && {
echo
echo "¡NECESITA EJECUTAR LA INSTALACIÓN COMO ROOT!"
echo
rm install.sh
exit 0
}

ubuntuV=$(lsb_release -r | awk '{print $2}' | cut -d. -f1)

[[ $(($ubuntuV < 20)) = 1 ]] && {
clear
echo "¡INSTÁLELO EN UBUNTU 20.04 O 22.04! EL TUYO ES $ubuntuV"
echo
rm /root/install.sh
exit 0
}
[[ -e /root/DTunnel/src/index.ts ]] && {
  clear
  echo "EL PANEL DE CONTROL YA ESTÁ INSTALADO. ¿QUIERES ELIMINARLO? (s/n)"
  read remo
  [[ $remo = @(s|S) ]] && {
  cd /root/DTunnel
  rm -r painelbackup > /dev/null
  mkdir painelbackup > /dev/null
  cp prisma/database.db painelbackup
  cp .env painelbackup
  zip -r painelbackup.zip painelbackup
  mv painelbackup.zip /root
  rm -r /root/DTunnel
  rm /root/install.sh
  echo "¡Eliminado con éxito!"
  exit 0
  }
  exit 0
}
clear
echo "¿QUÉ PUERTO QUIERES ACTIVAR?"
read porta
echo
echo "Instalando Panel Dtunnel Mod..."
echo
sleep 3
#========================
apt-get update -y
apt-get update -y
apt-get install wget -y
apt-get install curl -y
apt-get install zip -y
apt-get install npm -y
apt-get install cron -y
apt-get install screen -y
apt-get install git -y
curl -s -L https://raw.githubusercontent.com/DiegoPintoTeam/DTunnel/main/setup_20.x | bash
apt-get install -y nodejs -y
#=========================
git clone https://github.com/DiegoPintoTeam/DTunnel.git
cd /root/DTunnel 
chmod +x pon poff menudt backmod
mv pon poff menudt backmod /bin
echo "PORT=$porta" > .env
echo "NODE_ENV=\"production\"" >> .env
echo "DATABASE_URL=\"file:./database.db\"" >> .env
token1=$(node -e "console.log(require('crypto').randomBytes(100).toString('base64'));")
token2=$(node -e "console.log(require('crypto').randomBytes(100).toString('base64'));")
token3=$(node -e "console.log(require('crypto').randomBytes(100).toString('base64'));")
echo "CSRF_SECRET=\"$token1\"" >> .env
echo "JWT_SECRET_KEY=\"$token2\"" >> .env
echo "JWT_SECRET_REFRESH=\"$token3\"" >> .env
echo "ENCRYPT_FILES=\"7223fd56-e21d-4191-8867-f3c67601122a\"" >> .env
npm install
npx prisma generate
npx prisma migrate deploy
#=========================
clear
echo
echo
echo "PANEL DTUNNEL MOD ¡INSTALADO CORRECTAMENTE!"
echo "Los archivos se encuentran en el archivo /root/DTunnel"
echo
echo "Comando para ACTIVAR: pon"
echo "Comando para DESACTIVAR: poff"
echo
echo -e "\033[1;36mDigite comando: \033[1;37mmenudt \033[1;32m(Para acceder al menú del panel) \033[0m"
echo
rm /root/install.sh
pon
echo -e "\033[1;36mSU PANEL:\033[1;37m http://$IP\033[0m"
echo
echo -ne "\n\033[1;31mENTER \033[1;33mPara volver \033[1;32m! \033[0m"; read
cat /dev/null > ~/.bash_history && history -c
rm -rf wget-log* > /dev/null 2>&1
rm install* > /dev/null 2>&1
sleep 3
menudt
