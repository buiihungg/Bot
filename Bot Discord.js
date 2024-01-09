const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const PREFIX = '.';
const TOKEN = 'MTEyNzIyNzY2MDg0Njc4MDQxNg.Gy4MhY.mbFS5dHQW34-b3Fma-9m8gphtwoz3MBqhqqVqM';
const OWNER_ID = '916249344724828170';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1115287517005099070/vt0bRRG4LTFtKix_NUe3iaVw_8y6jwfzpxfNgI5c2O__C9NPFjcJTu0frZNcF_tF4ATq';
const generatedKeys = new Set();
const blacklistedPlayers = new Set();

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Whitelist Lua Start");  // Nội dung hiển thị khi bạn truy cập trang web
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

if (blacklistedPlayers.has(message.author.id)) {
    return message.reply('Blacklist ID.');
}

if (blacklistedPlayers.has(message.author.id) || (message.member && message.member.roles.cache.some(role => role.name === 'Blacklist ID'))) {
    return message.reply('Blacklist ID.');
}
    if (!message.content.startsWith(PREFIX)) return;
  
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
  
    const hasPremiumWhitelistRole = message.member && message.member.roles.cache.some(role => role.name === 'Premium Whitelist');

      
if (command === 'checkblacklistid') {
    const blacklistedRole = message.guild.roles.cache.find(role => role.name === 'Blacklist ID');

    if (!blacklistedRole) {
        return message.reply('Không thể tìm thấy vai trò Id Blacklist trong máy chủ này.');
    }

    // Lấy tất cả các thành viên và sau đó lọc theo vai trò
    const membersWithRole = message.guild.members.cache.filter(member => member.roles.cache.has(blacklistedRole.id));

    if (!membersWithRole.size) {
        return message.reply('Not Found Player In Blacklist.');
    }

    const memberList = membersWithRole.map(member => `${member.user.tag} (${member.id})`).join('\n');

    const embed = new Discord.MessageEmbed()
        .setTitle('Black List Id')
        .setColor('RED') 
        .setDescription(memberList)
        .setFooter(`Tổng cộng: ${membersWithRole.size} người dùng`);
        
            return message.channel.send({ embeds: [embed] });
}

  if (command === 'blacklist' && message.author.id === OWNER_ID) {
    const playerToBlacklist = args[0];

    if (!playerToBlacklist) {
        return message.reply('Send ID Please.');
    }

    blacklistedPlayers.add(playerToBlacklist);
    const role = message.guild.roles.cache.find(role => role.name === 'Blacklist ID');
    const memberToBlacklist = message.guild.members.cache.get(playerToBlacklist);

    if (role && memberToBlacklist) {
        memberToBlacklist.roles.add(role);
        message.reply(`Người chơi ${playerToBlacklist} Add To Blacklist ID.`);
    } else {
        message.reply('Not Found Player Role!');
    }
    return;
}



    if (command === 'getscript' && hasPremiumWhitelistRole) {
    message.reply('loadstring(game:HttpGet(""))()\nAquaKey("' + message.author.id + '")')
        .then(replyMessage => {
            // Xóa tin nhắn sau 15 giây (10000 mili giây)
            setTimeout(() => {
                replyMessage.delete();
            }, 10000);
        })
        .catch(error => {
            console.error("Không thể xóa tin nhắn:", error);
        });
    return;
}

const allowedRole = message.guild.roles.cache.find(role => role.name === 'Owner Access');
if (command === 'warn' && message.member.roles.cache.has(allowedRole.id)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const userId = args[1]; // Lấy ID của người cần warn
    const warnMessage = args.slice(2).join(' '); // Lấy tin nhắn warn

    const userToWarn = message.guild.members.cache.get(userId);

    if (!userToWarn) {
        return message.reply('Not Found User!!.');
    }

    userToWarn.send(`You Have Been Warned With Reasons: ${warnMessage}`)
        .catch(err => console.error(`Không thể gửi tin nhắn: ${err}`));

    message.channel.send(`User ID Warned ${userId} with reason: ${warnMessage}`);
}

    if (command === 'key' && message.author.id === OWNER_ID) {
        const amount = parseInt(args[0]);

        if (isNaN(amount)) {
            return message.reply('Please provide a valid number of keys to generate.');
        }

        let keys = [];
        for (let i = 0; i < amount; i++) {
            let key = generateKey();
            keys.push(key);
            generatedKeys.add(key);
        }

        // Gửi key vào DMs cho owner
        const owner = await client.users.fetch(OWNER_ID);
        owner.send(`\n${keys.join('\n')}`).catch(error => {
            console.error(`Could not send DM to the owner.\n`, error);
            message.reply('Failed to send keys via DM. Please check your DM settings.');
        });
    }

    else if (command === 'redeem') {
        const keyToRedeem = args[0];

        if (generatedKeys.has(keyToRedeem)) {
            generatedKeys.delete(keyToRedeem);
            const role = message.guild.roles.cache.find(role => role.name === 'Premium Whitelist');
            if (role) {
                message.member.roles.add(role);
                message.reply('You have successfully redeemed the key and received the role!');

                // Gửi thông tin người dùng vào webhook
                const payload = {
                    content: `${message.member.user.username} (${message.member.id}) has redeemed a key successfully.`
                };

                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                message.reply('Role not found!');
            }
        } else {
            message.reply('Invalid or already used key.');
              }
    }
});

function generateKey() {
    const randomNumber = Math.floor(Math.random() * 100000000000000); // Số ngẫu nhiên từ 0 đến 999999999999999
    const paddedNumber = randomNumber.toString().padStart(15, '0'); // Đảm bảo chuỗi có 15 chữ số bằng cách thêm số 0 vào đầu nếu cần
    return 'SH-' + paddedNumber;
}


client.login(TOKEN);
