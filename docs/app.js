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

    // 用来检查最后一句的最后一个字符
    const legalEndChars = ["。", "！", "？"];

    for(const line of lines){

        if(line === ""){
            continue;
        }

        const parts = line.split("，");


        // 检查每一句是否纯中文
        for(let j = 0; j < parts.length; j++){

            let sentence = parts[j].trim();

            if(j === parts.length - 1){
                if(legalEndChars.includes(sentence.trim().slice(-1))){
                    sentence = sentence.trim().slice(0, -1);
                }
            }

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

    if(final_pingze === "平"){

        return `<span class="ping">平</span>`;

    }
    else if(final_pingze === "仄"){

        return `<span class="ze">仄</span>`;

    }
    else if(final_pingze === "疑"){

        return `<span class="yi">疑</span>`;

    }

}


// 检查粤拼平仄
function checkJyutpingPingze(jyutping){

    const ruPattern = ["k", "t", "p"];

    // 这里可以实现平仄检查的逻辑


    if((jyutping.slice(-1) === "1" || jyutping.slice(-1) === "4") && ! ruPattern.includes(jyutping.slice(-2, -1))){
        
        return "平";
    
    }
    else{

        return "仄";

    }

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


// 生成粤拼注音的 HTML

function generateJyutpingHTML(item){

    const jyutping = item.jyutping[0];

    let jyutpingPingze = checkJyutpingPingze(jyutping);

    if(jyutpingPingze === "平"){

        const jyutpingHTML = 
        `
        <span class="jyutping-cell">

            <span class="jyutping-tone">
                ${item.jyutping[0]}
            </span>

            <span class="jyutping-char">
                <span class="ping">
                ${item.traditional}
                </span>
            </span>
        </span>
        `;
        return jyutpingHTML;

    }
    else {

        const jyutpingHTML = 
        `
        <span class="jyutping-cell">

            <span class="jyutping-tone">
                ${item.jyutping[0]}
            </span>

            <span class="jyutping-char">
                <span class="ze">
                ${item.traditional}
                </span>
            </span>
        </span>
        `;
        return jyutpingHTML;
    }

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

        // 按逗号分成若干句
        let sentences = line.split("，");

        // 检查最后一句的最后一个字符
        const legalEndChars = ["。", "！", "？"];
        
        if(legalEndChars.includes(sentences[sentences.length - 1].trim().slice(-1))){
            sentences[sentences.length - 1] = sentences[sentences.length - 1].trim().slice(0, -1);
        }

        for (let sentence of sentences) {

            let sentenceTraditional = "";

            let sentenceTraditionalHTML = "";

            let sentenceJyutping = "";

            let sentencePingze = "";

            for (let ch of sentence) {

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
                    sentenceJyutping += generateJyutpingHTML(item);
                    sentencePingze += checkPingze(item.readings);
                    sentenceTraditionalHTML += generateTraditionalHTML(item);
                }
            }

            // 每句转换后重新加入逗号
            traditional += sentenceTraditional + "，";
            traditionalHTML += sentenceTraditionalHTML + "，";
            jyutping += sentenceJyutping + "，";
            pingze += sentencePingze + "，";
        }

        // 去掉最后多余的逗号
        traditional = traditional.slice(0, -1);
        traditional += "。";
        traditionalHTML = traditionalHTML.slice(0, -1);
        jyutping = jyutping.slice(0, -1);
        jyutping += `<span class="line-break"></span>`;
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
    .innerHTML = jyutpingLines.join("<br>");

    document
    .getElementById("pingze")
    .innerHTML = pingzeLines.join("<br>");

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