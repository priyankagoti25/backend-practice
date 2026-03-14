FROM node:22.14.0

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=qwerty

RUN mkdir -p backend-practice

COPY . /backend-practice

CMD ["npm", "run", "dev"]