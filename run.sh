#!/bin/bash
#lanIp="$(ip -4 -o -br addr|awk '$0 ~ /^[we]\w+\s+UP\s+/ {str = gsub("/[1-9][0-9]*", "", $0); print $3}')";
#wanIp="$(curl https://ipinfo.io/ip 2>/dev/null)";
#
#echo "Your private ip is: ${lanIp}";
#echo "Your public ip is: ${wanIp}";

npx prisma generate
npx prisma migrate dev
npm run dev


# npx prisma studio  use on seperate console if  you want to see the database on http://localhost:5555/
