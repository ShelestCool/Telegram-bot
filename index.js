const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options')
const token = '5912123999:AAHaldtubyVLZ39sZ0pEAAdJYxPpofquflw';

const bot = new TelegramApi(token, {polling: true});
const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать.');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Уагадай число от 0 до 9'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/1.webp');
            return bot.sendMessage(chatId, `Добро пожаловать в Trash Gang!`);
        }

        if (text === '/info') {
            return bot.sendMessage(chatId, `Ваше имя: ${msg.from.first_name}. Ваш логин: ${msg.from.username}.`);
        }

        if (text === '/game') {
            return startGame(chatId);
        }
        return bot.sendMessage(chatId, 'Произошла какая то ошибочка ー_ー')
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        console.log(data);
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