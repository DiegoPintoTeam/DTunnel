GREEN='\033[0;32m'
RESET='\033[0m'
export DTUNNEL_SUPERVISED=1

while : 
do
    echo -e "${GREEN}Comenzando en Modo Anti caída, espere...${RESET}"
    npm run server
    sleep 1
done
