// 导入配置
let CONFIG;
try {
    CONFIG = await import('./config.js');
    console.log('配置加载成功:', CONFIG);
} catch (error) {
    console.error('配置文件加载失败，详细错误:', error);
    alert('请先配置API密钥！具体步骤请查看README.md');
}

async function sendRequest() {
    const input = document.getElementById('input');
    const response = document.getElementById('response');
    const content = input.value.trim();

    console.log('开始发送请求...');
    console.log('使用的配置:', CONFIG);

    if (!CONFIG?.default?.coze?.token) {
        const errorMsg = '错误：未配置API密钥，请参考README.md进行配置';
        console.error(errorMsg);
        response.textContent = errorMsg;
        return;
    }

    if (!content) {
        alert('请输入问题内容！');
        return;
    }

    // 清空之前的响应
    response.textContent = '正在等待响应...\n';

    try {
        console.log('准备发送API请求...');
        const requestBody = {
            bot_id: CONFIG.default.coze.botId,
            user_id: '123456789',
            stream: true,
            auto_save_history: true,
            additional_messages: [
                {
                    role: 'user',
                    content: content,
                    content_type: 'text'
                }
            ]
        };
        console.log('请求体:', requestBody);

        const response_stream = await fetch(CONFIG.default.coze.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.default.coze.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('收到响应状态:', response_stream.status);
        
        if (!response_stream.ok) {
            throw new Error(`HTTP error! status: ${response_stream.status}`);
        }

        // 创建响应流读取器
        const reader = response_stream.body.getReader();
        const decoder = new TextDecoder();

        console.log('开始读取流数据...');
        // 读取流数据
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('数据流读取完成');
                break;
            }
            
            // 解码并显示数据
            const chunk = decoder.decode(value, { stream: true });
            console.log('收到数据块:', chunk);
            response.textContent += chunk;
        }
    } catch (error) {
        const errorMsg = `发生错误：${error.message}`;
        console.error('API请求详细错误:', error);
        response.textContent = errorMsg;
        
        // 添加更详细的错误提示
        if (error.message.includes('401')) {
            response.textContent += '\n\nAPI密钥可能无效，请检查配置文件中的token是否正确。';
        } else if (error.message.includes('404')) {
            response.textContent += '\n\n接口地址可能有误，请检查apiUrl配置。';
        } else if (error.message.includes('Failed to fetch')) {
            response.textContent += '\n\n网络连接失败，请检查您的网络连接或是否启用了CORS。';
        } else if (error.message.includes('TypeError')) {
            response.textContent += '\n\n配置文件格式可能有误，请检查config.js的格式是否正确。';
        }
    }
}
