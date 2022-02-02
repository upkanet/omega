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

function fileContent(f,callback){
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        callback(event.target.result);
    });
    reader.readAsText(f);
}


$('#upload').change((e)=>{
    let f = e.target.files[0];
    load(f);
})

function load(f){
    fileContent(f,(c)=>{
        let lines = c.split(/\r?\n/);
        let en = '';
        let vs = '';
        lines.forEach(l => {
            d = l.split(';');
            if(d.length != 5) return 0;

            if(d[0] != '') en = Number(d[0]);
            if(d[1] != '') vs = Number(d[1]);
            let v = Number(d[2]);
            let i = Number(d[3]);
            let p = Number(d[4]);
            if(electrodes[en-1] === undefined) electrodes[en-1] = new Electrode(en);
            electrodes[en-1].addPoint(p,vs,v,i);
        });
        generateSelect();
        console.log(electrodes);
    });
}

let electrodes = [];

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

class Electrode{
    constructor(n){
        this.n = n;
        this.passes = [];
    }

    addPoint(pass,vs,v,i){
        if(this.passes[pass-1] === undefined) this.passes[pass-1] = [];
        this.passes[pass-1].push({vs:vs,v:v,i:i});
    }

    plotly(canid){
        let data = this.plotdata();
        Plotly.newPlot(canid,data,layout);
    }
    
    plotdata(){
        let data = [];
        for(let i = 0; i < this.passes.length; i++){
            data.push({
                name:`E${this.n} Pass #${i+1}`,
                x: this.getValues(i+1,'v'),
                y: this.getValues(i+1,'i'),
                type: 'scatter'
            });
        }    
        return data;
    }

    getValues(pass,item){
        return this.passes[pass-1].map(e => e[item]);
    }

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
    electrodes[e-1].plotly('plotly');
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
    let elchecked = getCheckedElectrodes();
    if(elchecked.length == 0) return 0;

    let data = [];
    elchecked.forEach((en)=>{
        let d = electrodes[en-1].plotdata();
        data = data.concat(d);
    })

    data = avgPlot(data);

    Plotly.newPlot('multiplotly',data,layout);
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