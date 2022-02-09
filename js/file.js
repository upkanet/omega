import {Electrode} from './electrodes.js';

function fileContent(f){
    return new Promise( (resolve,reject)=>{
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            resolve(event.target.result);
        });
        reader.readAsText(f);
    })
}

function loadCV(f){
    return new Promise( (resolve, reject) => {
        fileContent(f).then((c)=>{
            let electrodes = [];
            let lines = c.split(/\r?\n/);
            let en = '';
            let vs = '';
            lines.forEach(l => {
                let d = l.split('\t');
                if(d.length != 5) return 0;
                if(d[0] == 'Column 1') return 0;
    
                if(d[0] != '') en = Number(d[0]);
                if(d[1] != '') vs = Number(d[1]);
                let v = Number(d[3]);
                let i = Number(d[4]);
                let p = Number(d[2]);
                let ren = map[en-1];
                if(ren != 0){
                    if(electrodes[ren-1] === undefined) electrodes[ren-1] = new Electrode(ren);
                    electrodes[ren-1].addPointCV(p,vs,v,i);
                }
            });
            console.log(electrodes);
            resolve(electrodes);
        });
    });
}

function loadEIS(f){
    return new Promise( (resolve, reject) => {
        fileContent(f).then((c)=>{
            let electrodes = [];
            let lines = c.split(/\r?\n/);
            let en = '';
            lines.forEach(l => {
                let d = l.split(';');
                if(d.length != 4) return 0;
    
                if(d[0] != '') en = Number(d[0]);
                let f = Number(d[1]);
                let m = Number(d[2]);
                let a = Number(d[3]);
                if(electrodes[en-1] === undefined) electrodes[en-1] = new Electrode(en);
                electrodes[en-1].addPointEIS(f,m,a);
            });
            resolve(electrodes);
        });
    });
}

let map = [0,0,0,58,55,67,66,87,86,75,84,64,73,72,71,61,53,52,41,44,32,33,12,13,24,15,35,26,27,28,38,46,47,0,0,0,0,57,56,68,78,77,76,65,85,74,83,82,63,62,54,51,42,43,31,21,22,23,34,14,25,16,17,36,37,45,48,0];


export {loadCV,loadEIS};