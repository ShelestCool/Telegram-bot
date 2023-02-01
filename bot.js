const TelegramApi = require('node-telegram-bot-api');
const axios = require('axios');
const {gameOptions, againOptions} = require('./options')
const token = '5912123999:AAHaldtubyVLZ39sZ0pEAAdJYxPpofquflw';

const bot = new TelegramApi(token, {polling: true});

const chats = {};
const notes = [];

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать.');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

setInterval(async () => {
    for (let i = 0; i < notes.length; i++) {
        const curDate = new Date().getHours() + ':' + new Date().getMinutes();
        if (notes[i]['time'] === curDate) {
            await bot.sendMessage(notes[i]['uid'], 'Напоминаю, что вы должны: ' + notes[i]['text'] + ' сейчас.');
            notes.splice(i, 1);
        }
    }
}, 1000);

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра, угадай число'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const location = msg.location;

        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/1.webp');
            return bot.sendMessage(chatId, `Добро пожаловать, меня зовут Бот!`);
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, `Ваше имя: ${msg.from.first_name}. Ваш логин: ${msg.from.username}.`);
        }

        if (text === '/game') {
            return startGame(chatId);
        }

        if (location) {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=0aa3d31e641faaefacedb907d85686bf`;
            const response = await axios.get(url);
            const data = response.data;
            await bot.sendMessage(chatId, `${data.name} (${data.sys.country}): ${Math.round(data.main.temp - 273.15)} C°. At the moment there are ${data.weather[0].main} outside, the wind speed is - ${data.wind.speed} km/h!`);
        }
    })

    bot.onText(/note (.+) в (.+)/, function (msg, match) {
        const userId = msg.from.id;
        const text = match[1];
        const time = match[2];

        notes.push({'uid': userId, 'time': time, 'text': text});

        bot.sendMessage(userId, 'Отлично! Я обязательно напомню вам °_°');
    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') {
            return startGame(chatId);
        }

        if (data == chats[chatId]) {
            await bot.sendMessage(chatId, `Поздравляю, ты угадал загаданное число: ${chats[chatId]}`, againOptions);
        } else {
            await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions);
        }
    })
}

start();