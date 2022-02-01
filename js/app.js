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
        findBoundries();
        axis('plot');
        console.log(electrodes);
    });
}

let electrodes = [];
let imin = null;
let imax = null;
let vmin = null;
let vmax = null;

function generateSelect(){
    let select = $('#electrodesSelect');
    select.html('<option selected>-</option>');
    for(let i = 0;i<electrodes.length;i++){
        select.append(`<option value="${i+1}">Electrode #${i+1}</option>`);
    }
}

function findBoundries(){
    electrodes.forEach((e)=>{
        imin = Math.min(imin,e.getMin('i'));
        imax = Math.max(imax,e.getMax('i'));
        vmin = Math.min(vmin,e.getMin('v'));
        vmax = Math.max(vmax,e.getMax('v'));
    })
    console.log("limits",imin,imax,vmin,vmax);
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

    plot(canid,pass){
        let canvas = document.getElementById(canid);
        let w = canvas.width;
        let h = canvas.height;
        let ctx = canvas.getContext('2d');

        let voltages = this.getValues(pass,'v');
        let intensities = this.getValues(pass,'i');

        ctx.strokeStyle = 'blue';

        ctx.beginPath();
        voltages.forEach((v,j)=>{
            let i = intensities[j];
            let x = (v - vmin) / (vmax - vmin) * w;
            let y = (i - imin) / (imax - imin) * h;
            if(j == 0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
            ctx.stroke();
        })
    }

    getMin(item){
        let min = null;
        this.passes.forEach((e,i)=>{
            let data = this.getValues(i+1,item);
            min = Math.min(min,...data);
        })
        return min;
    }

    getMax(item){
        let max = null;
        this.passes.forEach((e,i)=>{
            let data = this.getValues(i+1,item);
            max = Math.max(max,...data);
        })
        return max;
    }

    getValues(pass,item){
        return this.passes[pass-1].map(e => e[item]);
    }

}

function selectElectrode(){
    let e = $('#electrodesSelect').val();
    if(isNaN(e)) return 0;

    clear('plot');

    let npass = electrodes[e-1].passes.length;
    let pselect = $('#passesSelect');
    pselect.html('<option selected>-</option>');
    for(let i = 0; i < npass; i++){
        pselect.append(`<option value="${i+1}">${i+1}</option>`)
    }
}

$('#electrodesSelect').change(selectElectrode);

function selectPass(){
    let e = $('#electrodesSelect').val();
    let p = $('#passesSelect').val();
    electrodes[e-1].plot('plot',p);
}

$('#passesSelect').change(selectPass);

function clear(canid){
    let canvas = document.getElementById(canid);
    let w = canvas.width;
    let h = canvas.height;
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,w,h);
    axis('plot');
}

function axis(canid){
    let canvas = document.getElementById(canid);
    let w = canvas.width;
    let h = canvas.height;
    let ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'black';

    ctx.beginPath();
    let y0 = (0 - imin) / (imax - imin) * h;
    ctx.moveTo(0,y0);
    ctx.lineTo(w,y0);
    ctx.stroke();

    ctx.beginPath();
    let x0 = (0 - vmin) / (vmax - vmin) * w;
    ctx.moveTo(x0,0);
    ctx.lineTo(x0,h);
    ctx.stroke();
}