const legalEndChars = ["。", "！", "？", "：", "；", "，"];

const chinesePattern = /^[\u4e00-\u9fff]+$/;

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

    for(const line of lines){

        if(line === ""){
            continue;
        }

        const parts = line.split("，");


        // 检查每一句是否纯中文
        for(let j = 0; j < parts.length; j++){

            let sentence = parts[j].trim();

            if(sentence === ""){
                continue;
            }

            // 最后一个字符可以是终止的中文符号

            if(j === parts.length - 1){
                if(legalEndChars.includes(sentence.trim().slice(-1))){
                    sentence = sentence.trim().slice(0, -1);
                }
            }

            if(!chinesePattern.test(sentence)){
                alert(`“${line}”，第 ${j+1} 句有非法字符`);
                return false;
            }

            for (let ch of sentence) {
                if (!dictionary[ch] && !traditionalMap[ch]) {
                    alert(`“${line}”，第 ${j+1} 句的字“${ch}”可能是新简体字，无对应的字典项`);
                }
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
                粤拼：${jyutping}
                韵部：
                ${rhyme}
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

        if(line === ""){
            continue;
        }

        let traditional = "";

        let traditionalHTML = "";

        let jyutping = "";

        let pingze = "";

        // 按逗号分成若干句
        const sentences = line.split("，");
        

        for(let j = 0; j < sentences.length; j++){

            let sentence = sentences[j].trim();

            if(sentence === ""){
                continue;
            }

            // 检查最后一句的最后一个字符

            if(j === sentences.length - 1){
                if(legalEndChars.includes(sentence.trim().slice(-1))){
                    sentence = sentence.trim().slice(0, -1);
                }
            }

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
                    sentenceJyutping += 
                    `
                    <span class="jyutping-cell">
                        <span class="jyutping-tone">
                            ???
                        </span>
                        <span class="jyutping-char">
                            <span class="yi">
                            ${simplified_ch}
                            </span>
                        </span>
                    </span>
                    `;
                    sentencePingze += `<span class="yi">无</span>`;
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



// 单字提示

const globalTooltip =
    document.getElementById("global-tooltip");


document.addEventListener("mouseover", function(event) {

    const char = event.target.closest(".char-tooltip");

    if (!char) {
        return;
    }

    const tooltipText =
        char.querySelector(".tooltip-text");

    if (!tooltipText) {
        return;
    }


    // 获取韵部文字
    globalTooltip.textContent = tooltipText.textContent.trim();


    // 获取当前汉字的位置
    const rect = char.getBoundingClientRect();


    // 先显示，以便取得 tooltip 的宽高
    globalTooltip.classList.add("show");


    const tooltipRect = globalTooltip.getBoundingClientRect();


    // 放在汉字正上方
    const left = rect.left + rect.width / 2 - tooltipRect.width / 2;

    const top = rect.top - tooltipRect.height - 8;

    globalTooltip.style.left = left + "px";

    globalTooltip.style.top = top + "px";

});

document.addEventListener("mouseout", function(event) {

    const char =
        event.target.closest(".char-tooltip");

    if (!char) {
        return;
    }

    globalTooltip.classList.remove("show");

});

document.addEventListener("click", function(event) {

    const char = event.target.closest(".char-tooltip");

    // 点击的不是繁体字，就关闭 tooltip
    if (!char) {
        globalTooltip.classList.remove("show");
        return;
    }

    const tooltipText =
        char.querySelector(".tooltip-text");

    if (!tooltipText) {
        return;
    }

    globalTooltip.textContent =
        tooltipText.textContent.trim();

    const rect =
        char.getBoundingClientRect();

    // 先显示，才能取得 tooltip 尺寸
    globalTooltip.classList.add("show");

    const tooltipRect =
        globalTooltip.getBoundingClientRect();

    let left =
        rect.left
        + rect.width / 2
        - tooltipRect.width / 2;

    let top =
        rect.top
        - tooltipRect.height
        - 8;


    // 防止左边超出手机屏幕
    if (left < 8) {
        left = 8;
    }


    // 防止右边超出手机屏幕
    if (left + tooltipRect.width > window.innerWidth - 8) {

        left =
            window.innerWidth
            - tooltipRect.width
            - 8;
    }


    // 上面空间不足，就显示在汉字下面
    if (top < 8) {
        top = rect.bottom + 8;
    }


    globalTooltip.style.left =
        left + "px";

    globalTooltip.style.top =
        top + "px";

});