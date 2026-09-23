let dictionary = {};

let traditionalMap = {};

let currentTraditional = "";

// 读取 JSON，生成繁体到简体的映射字典

fetch("cantonese.json")
.then(response => response.json())
.then(data => {

    dictionary = data;

    // 创建繁体到简体映射

    for(const simplified_ch in dictionary){

        const traditional =
            dictionary[simplified_ch].traditional;

        traditionalMap[traditional] =
            simplified_ch;
    }
});

// 检查输入格式

function checkFormat(text){

    const lines = text.split("\n");

    const chinesePattern = /^[\u4e00-\u9fff]+$/;

    for(const line of lines){

        if(line === ""){
            continue;
        }

        const parts = line.split("，");

        // 超过一个逗号
        if(parts.length > 2){
            alert(`“${line}”，此句有多于一个逗号`);
            return false;
        }

        // 检查每一句是否纯中文
        for(let j = 0; j < parts.length; j++){

            const sentence = parts[j].trim();

            if(!chinesePattern.test(sentence)){
                alert(`“${line}”，第 ${j+1} 句有非法字符`);
                return false;
            }
        }
    }

    return true;
}


// 检查平仄

function checkPingze(readings){

    const pingPattern = ["上平声部", "下平声部"];

    let final_pingze = "";

    // 这里可以实现平仄检查的逻辑

    for (const reading of readings){

        // 在这里可以对每个 reading 进行平仄检查

        if(pingPattern.includes(reading.shengbu)){
            if (final_pingze === "仄"){
                return "疑";
            }
            else{
                final_pingze = "平";
            }
        }
        else{
            if (final_pingze === "平"){
                return "疑";
            }
            else{
                final_pingze = "仄";
            }
        }

    }

    return final_pingze;
}


// 生成拼音和声调的 HTML

function generateTraditionalHTML(item){

    let readings = [];

    for(const reading of item.readings){

        readings.push(`${reading.shengbu}-${reading.rhyme}`);

    }

    const jyutping = item.jyutping.join("/");

    const rhyme = readings.join("/");

    const traditionalHTML = 
    `
    <span class="char-tooltip">
        ${item.traditional}
        <span class="tooltip-text">
            <div>
                粤拼：${jyutping}
            </div>
            <div>
                韵部：
                <br>
                ${rhyme}
            </div>
        </span>
    </span>
    `;

    return traditionalHTML;

}




// 搜索并转换
// 
// 字典格式：
// "中": {
//     "jyutping": [
//         "zung1",
//         "zung3"
//     ],
//     "traditional": "中",
//     "readings": [
//         {
//             "shengbu": "上平声部",
//             "rhyme": "一东"
//         },
//         {
//             "shengbu": "去声部",
//             "rhyme": "一送"
//         }
//     ]
// },

function search(){

    const text =
        document.getElementById("input")
        .value.trim();

    if(!checkFormat(text)){
        console.log("check format failed");
        return;
    }

    const lines = text.split("\n");

    let traditionalLines = [];

    let traditionalHTMLLines = [];

    let jyutpingLines = [];

    let pingzeLines = [];

    for(const line of lines){

        let traditional = "";

        let traditionalHTML = "";

        let jyutping = "";

        let pingze = "";

        // 按逗号分成两句
        const sentences = line.split("，");

        for (const sentence of sentences) {

            let sentenceTraditional = "";

            let sentenceTraditionalHTML = "";

            let sentenceJyutping = "";

            let sentencePingze = "";

            for (const ch of sentence) {

                // 如果是繁体字，转化为简体再查

                let simplified_ch = ch;
                if(traditionalMap[ch]){
                    simplified_ch = traditionalMap[ch];
                }

                // 如果字典中没有，直接输出原字和“???”

                const item = dictionary[simplified_ch];
                if (!item) {
                    sentenceTraditional += simplified_ch;
                    sentenceJyutping += "???" + " ";
                    sentencePingze += "无";
                    sentenceTraditionalHTML += 
                    `
                    <span class="char-tooltip">
                        ${simplified_ch}
                        <span class="tooltip-text">
                            ???
                        </span>
                    </span>
                    `;
                }
                else {
                    sentenceTraditional += item.traditional;
                    sentenceJyutping += item.jyutping[0] + " ";
                    sentencePingze += checkPingze(item.readings);
                    sentenceTraditionalHTML += generateTraditionalHTML(item);
                }
            }

            // 每句转换后重新加入逗号
            traditional += sentenceTraditional + "，";
            traditionalHTML += sentenceTraditionalHTML + "，";
            jyutping += sentenceJyutping.trim() + "，";
            pingze += sentencePingze.trim() + "，";
        }

        // 去掉最后多余的逗号
        traditional = traditional.slice(0, -1);
        traditional += "。";
        traditionalHTML = traditionalHTML.slice(0, -1);
        jyutping = jyutping.slice(0, -1);
        pingze = pingze.slice(0, -1);

        // 将转换后的每行加入数组
        traditionalLines.push(traditional);
        traditionalHTMLLines.push(traditionalHTML);
        jyutpingLines.push(jyutping);
        pingzeLines.push(pingze);
    }

    currentTraditional = traditionalLines.join("\n");

    document
    .getElementById("traditional")
    .innerHTML = traditionalHTMLLines.join("<br>");

    document
    .getElementById("jyutping")
    .textContent = jyutpingLines.join("\n");

    document
    .getElementById("pingze")
    .textContent = pingzeLines.join("\n");

}

// 粤语朗读

function speak(){

    if(currentTraditional=="")
        return;

    const u =
        new SpeechSynthesisUtterance(currentTraditional);

    const voices =
        speechSynthesis.getVoices();

    const cantonese =
        voices.find(v=>

            v.lang=="zh-HK" ||

            v.lang=="yue-HK"

        );

    if(cantonese){

        u.voice=cantonese;

    }

    else{

        u.lang="zh-HK";

    }

    speechSynthesis.speak(u);

}