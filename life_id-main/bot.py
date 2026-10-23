import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import requests

TOKEN = '8846453658:AAGfw0FFtP28tUzFY7QazAyIZJ0h2rghP64'
bot = telebot.TeleBot(TOKEN)

WEBAPP_URL = 'http://localhost:8080' # Can be replaced with ngrok URL when deployed publicly

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    # WebApp button to open LifeID Shifokor Portali
    markup.add(InlineKeyboardButton("🏥 LifeID Portalni ochish", web_app=WebAppInfo(url=WEBAPP_URL)))
    markup.add(InlineKeyboardButton("🔍 Donor qidirish", callback_data='search_donor'))
    markup.add(InlineKeyboardButton("🤖 Gemini AI Tibbiy Maslahat", callback_data='ai_help'))

    welcome_text = (
        f"Assalomu alaykum, {message.from_user.first_name}!\n\n"
        "🏥 **LifeID — Raqamli tibbiy identifikatsiya tizimi**ga xush kelibsiz.\n"
        "Bu bot orqali favqulodda holatlarda bemor ma'lumotlarini tezkor aniqlash, qon donorlarini topish va Gemini AI yordamida tibbiy maslahat olishingiz mumkin.\n\n"
        "Quyidagi tugmalardan birini tanlang:"
    )
    bot.send_message(message.chat.id, welcome_text, reply_markup=markup, parse_mode='Markdown')

@bot.callback_query_handler(func=lambda call: True)
def callback_query(call):
    if call.data == 'search_donor':
        bot.answer_callback_query(call.id)
        bot.send_message(call.message.chat.id, "🔍 **Donor qidirish:**\nQon guruhi bo'yicha donor topish uchun LifeID Portaliga kiring va Donor bazasi bo'limidan foydalaning.", parse_mode='Markdown')
    elif call.data == 'ai_help':
        bot.answer_callback_query(call.id)
        bot.send_message(call.message.chat.id, "🤖 **Gemini AI Tibbiy Yordamchi:**\nIltimos, dori vositasi, tashxis yoki alomatlar bo'yicha savolingizni yozib yuboring (masalan: *'Aspirin va Penitsillin allergiyasi haqida nima deysiz?'*).", parse_mode='Markdown')

@bot.message_handler(func=lambda message: True)
def gemini_bot_chat(message):
    user_text = message.text
    # Simulate / call Gemini expert medical response in Uzbek
    response_text = (
        f"🤖 **Gemini AI (LifeID Assistant) tahlili:**\n\n"
        f"Sizning savolingiz: *\"{user_text}\"*\n\n"
        "🩺 **Klinik tavsiya:** Bemorning hayotiy ko'rsatkichlari (qon bosimi, qand miqdori) nazoratda bo'lishi lozim. Dori vositalarini tayinlashda surunkali kasalliklar va allergiyalarni tekshirishingiz so'raladi.\n\n"
        "_Qarorni shifokor qabul qiladi._"
    )
    bot.send_message(message.chat.id, response_text, parse_mode='Markdown')

if __name__ == '__main__':
    print("LifeID Telegram Bot ishga tushdi...")
    bot.infinity_polling()
</div>
