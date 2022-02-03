import {loadCV,loadEIS} from './file.js';

let layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
        color: "white"
    },
    xaxis:{
        title:"V"
    },
    yaxis:{
        title:"I"
    }
}

let electrodes = [];
let fullPath = "";

$('#uploadCV').change((e)=>{
    let f = e.target.files[0];
    fullPath = document.getElementById('uploadCV').value;
    loadCV(f).then((e)=>{
        electrodes = e;
        generateSelect();
        selectNext();
    });
})

$('#uploadEIS').change((e)=>{
    let f = e.target.files[0];
    fullPath = document.getElementById('uploadEIS').value;
    loadEIS(f).then((e)=>{
        electrodes = e;
        console.log(electrodes);
        generateSelect();
        selectNext();
    });
})


function generateSelect(){
    let select = $('#electrodesSelect');
    let check = $('#checkElectrodes');
    select.html('<option selected>-</option>');
    check.html('');
    for(let i = 0;i<electrodes.length;i++){
        select.append(`<option value="${i+1}">Electrode #${i+1}</option>`);
        check.append(`<input type="checkbox" class="btn-check el-check" id="E${i+1}" value="${i+1}"><label class="btn btn-outline-primary" for="E${i+1}">E${i+1}</label>`);
    }
    loadElectrodesFromCookie();
    $('.el-check').click(elCheckBinder);
}

function elCheckBinder(){
    saveElectrodesToCookie();
    multiElectrode();
}

function saveElectrodesToCookie(){
    let elchecked = JSON.stringify(getCheckedElectrodes());
    document.cookie = `elchecked=${elchecked};max-age=${604800000}`;
    console.log("cookie saved", document.cookie);
}

function loadElectrodesFromCookie(){
    let a = getCookie('elchecked');
    if(a === undefined || a.length == 0) return 0;
    let elchecked = JSON.parse(a);
    console.log('elchecked from cookies',elchecked);
    elchecked.forEach(en=>{
        $(`#E${en}`).prop('checked',true);
    });
    multiElectrode();
}

function selectElectrode(){
    let e = $('#electrodesSelect').val();
    if(isNaN(e)) return 0;

    let npass = electrodes[e-1].passes.length;
    let pselect = $('#passesSelect');
    pselect.html('<option selected>-</option>');
    for(let i = 0; i < npass; i++){
        pselect.append(`<option value="${i+1}">${i+1}</option>`)
    }
    Plotly.newPlot('plotly',electrodes[e-1].plotdata(),layout);
}

$('#electrodesSelect').change(selectElectrode);

function getCheckedElectrodes(){
    let elchecked = [];
    $('.el-check:checked').each((i,e)=>{
        elchecked.push(Number(e.value));
    })
    return elchecked;
}

function multiElectrode(){
    let data = multiElectrodeData();
    Plotly.newPlot('multiplotly',data,layout);
}

function multiElectrodeData(){
    let elchecked = getCheckedElectrodes();
    if(elchecked.length == 0) return 0;
    
    let data = [];
    elchecked.forEach((en)=>{
        let d = electrodes[en-1].plotdata();
        data = data.concat(d);
    })
    
    data = avgPlot(data);

    return data;
}

function avgPlot(data){
    if(data.length == 0)  return [];
    let ydata = [];
    data.forEach((d)=>{
        ydata.push(d.y);
    })
    let nydata = [];
    for(let i=0; i< ydata[0].length;i++){
        let sum = 0;
        for(let j = 0; j < ydata.length;j++){
            sum += ydata[j][i];
        }
        nydata[i] = sum / ydata.length;
    }

    return [{
        name: 'Average',
        x: data[0].x,
        y: nydata,
        type: 'scatter'
    }]
}

function selectNext(){
    let el = $('#electrodesSelect option:selected');
    el.removeAttr('selected');
    el.next().attr('selected','selected').change();

}

function selectPrev(){
    let el = $('#electrodesSelect option:selected');
    el.removeAttr('selected');
    el.prev().attr('selected','selected').change();
}

$('#prev-btn').click(selectPrev);
$('#next-btn').click(selectNext);

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function genCSV(){
    let data = multiElectrodeData();
    if(data == undefined || data == 0 || data.length == 0) return 0;
    let txt = '';
    let d = data[0];
    for(let i = 0; i < d.x.length; i++){
        txt += `${d.x[i]},${d.y[i]}\n`;
    }

    let fn = filename();

    download(`${fn}.csv`,txt);
}

$('#gencsv-btn').click(genCSV);

function filename(){
    if (fullPath) {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        var filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }
        return filename.split('.')[0];
    }
}