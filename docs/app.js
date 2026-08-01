let dictionary = {};

let currentTraditional = "";

// 读取 JSON

fetch("dict.json")
.then(response => response.json())
.then(data => {

    dictionary = data;

});

function search(){

    const word =
        document.getElementById("input").value.trim();

    const item =
        dictionary[word];

    if(!item){

        alert("没有找到");

        return;

    }

    currentTraditional =
        item.traditional;

    document.getElementById("traditional").textContent =
        item.traditional;

    document.getElementById("jyutping").textContent =
        item.jyutping;

    document.getElementById("shengbu").textContent =
        item.shengbu;

    document.getElementById("rhyme").textContent =
        item.rhyme;

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