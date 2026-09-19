#!/bin/bash
clear

# ===================== Estilo =====================
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
WHITE='\033[1;37m'
NC='\033[0m'
LOG="/root/dtunnel_install.log"
TOTAL_STEPS=9
STEP=0

banner() {
  echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║          ${WHITE}DTunnel Pro — Instalador${CYAN}            ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
}

step() {
  STEP=$((STEP + 1))
  echo -ne "${CYAN}[${STEP}/${TOTAL_STEPS}]${NC} ${WHITE}$1...${NC} "
}

ok() {
  echo -e "${GREEN}OK${NC}"
}

fail() {
  echo -e "${RED}FALLÓ${NC}"
  echo -e "${RED}Ocurrió un error en: $1${NC}"
  echo -e "${YELLOW}Revisa el log completo en: ${LOG}${NC}"
  exit 1
}

run_step() {
  local desc="$1"
  shift
  step "$desc"
  {
    echo "===== $desc ====="
    "$@"
  } >>"$LOG" 2>&1
  if [ $? -eq 0 ]; then
    ok
  else
    fail "$desc"
  fi
}

banner
: >"$LOG"

# ===================== Validaciones =====================
IP=$(wget -qO- ipv4.icanhazip.com 2>/dev/null || echo "TU_IP")

if [[ "$(whoami)" != "root" ]]; then
  echo
  echo -e "${RED}¡NECESITA EJECUTAR LA INSTALACIÓN COMO ROOT!${NC}"
  echo
  rm -f install.sh
  exit 1
fi

ubuntuV=$(lsb_release -r | awk '{print $2}' | cut -d. -f1)

if [[ $ubuntuV -lt 20 ]]; then
  clear
  echo -e "${RED}¡INSTÁLELO EN UBUNTU 20.04 O SUPERIOR! EL TUYO ES $ubuntuV${NC}"
  echo
  rm -f /root/install.sh
  exit 1
fi

if [[ -e /root/DTunnel/src/index.ts ]]; then
  clear
  banner
  echo -e "${YELLOW}Se detectó una instalación previa. Se hará un backup y se reinstalará automáticamente.${NC}"
  echo
  run_step "Deteniendo servicio actual" systemctl disable --now dtunnel.service
  rm -f /etc/systemd/system/dtunnel.service
  systemctl daemon-reload >>"$LOG" 2>&1
  run_step "Generando backup de la base de datos y .env" bash -c "
    cd /root/DTunnel &&
    rm -rf painelbackup &&
    mkdir -p painelbackup &&
    cp prisma/database.db painelbackup/ &&
    cp .env painelbackup/ &&
    zip -r painelbackup.zip painelbackup &&
    mv painelbackup.zip /root
  "
  run_step "Eliminando instalación anterior" rm -rf /root/DTunnel
  echo
fi

clear
banner
echo
read -rp "$(echo -e "${WHITE}¿Qué puerto deseas activar? [3000]: ${NC}")" porta
porta=${porta:-3000}
until [[ "$porta" =~ ^[0-9]+$ ]] && [ "$porta" -ge 1 ] && [ "$porta" -le 65535 ]; do
  read -rp "$(echo -e "${RED}Puerto inválido. Ingresa un número entre 1 y 65535: ${NC}")" porta
done

echo
echo -e "${CYAN}Iniciando instalación de DTunnel Pro...${NC}"
echo -e "${YELLOW}El detalle completo del proceso se guarda en ${LOG}${NC}"
echo

run_step "Actualizando repositorios del sistema" apt-get update -y
run_step "Instalando dependencias base (wget, curl, zip, cron, git)" apt-get install -y wget curl zip cron git
run_step "Configurando repositorio de Node.js 20.x" bash -c "curl -s -L https://raw.githubusercontent.com/DiegoPintoTeam/DTunnel/main/setup_20.x | bash"
run_step "Instalando Node.js" apt-get install -y nodejs
run_step "Descargando DTunnel Pro" git clone https://github.com/DiegoPintoTeam/DTunnel.git /root/DTunnel

cd /root/DTunnel || fail "Acceso al directorio /root/DTunnel"
chmod +x start.sh

echo "PORT=$porta" >.env
echo "NODE_ENV=\"production\"" >>.env
echo "DATABASE_URL=\"file:./database.db\"" >>.env
token1=$(node -e "console.log(require('crypto').randomBytes(100).toString('base64'));")
token2=$(node -e "console.log(require('crypto').randomBytes(100).toString('base64'));")
token3=$(node -e "console.log(require('crypto').randomBytes(100).toString('base64'));")
echo "CSRF_SECRET=\"$token1\"" >>.env
echo "JWT_SECRET_KEY=\"$token2\"" >>.env
echo "JWT_SECRET_REFRESH=\"$token3\"" >>.env
echo "ENCRYPT_FILES=\"7223fd56-e21d-4191-8867-f3c67601122a\"" >>.env

run_step "Instalando dependencias del proyecto (npm)" npm install --omit=dev --no-audit --no-fund
run_step "Preparando base de datos" bash -c "npx prisma generate && npx prisma migrate deploy && npx prisma db seed"
run_step "Configurando servicio del sistema" bash -c "
  install -m 644 systemd/dtunnel.service /etc/systemd/system/dtunnel.service &&
  systemctl daemon-reload &&
  systemctl enable --now dtunnel.service
"

clear
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      DTUNNEL PRO ¡INSTALADO CORRECTAMENTE!    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo
echo -e "${CYAN}Directorio:${NC}   ${WHITE}/root/DTunnel${NC}"
echo -e "${CYAN}Panel:${NC}        ${WHITE}http://$IP:$porta${NC}"
echo -e "${CYAN}Usuario:${NC}      ${WHITE}DTunnelPro${NC}"
echo -e "${CYAN}Contraseña:${NC}   ${WHITE}123456${NC}"
echo
echo -e "${YELLOW}Recuerda cambiar la contraseña por defecto desde tu perfil.${NC}"
echo

rm -f /root/install.sh
echo -ne "\n${RED}ENTER ${YELLOW}Para volver ${GREEN}! ${NC}"
read -r
cat /dev/null >~/.bash_history && history -c
rm -rf wget-log* >/dev/null 2>&1
rm -f install* >/dev/null 2>&1
