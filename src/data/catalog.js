export const MICROBES=Object.freeze({
 bacillus:{name:'Bacillus',color:'#70e5d6',slot:'defesa',description:'Biofilme temporário, resistência e endósporos.'},
 rhizobium:{name:'Rhizobium',color:'#a98cff',slot:'crescimento',description:'Aumenta a assimilação de N e acelera a evolução da raiz.'},
 mycorrhiza:{name:'Micorriza',color:'#d6afff',slot:'mobilidade',description:'Superimpulso e rede de hifas guiadas contra fungos.'},
 azospirillum:{name:'Azospirillum',color:'#7fd2ff',slot:'arquitetura',description:'Desvio, canais e maior ramificação lateral.'},
 pgpb:{name:'PGPB solubilizadora',color:'#ffd173',slot:'nutrição',description:'Coloniza e dissolve cristais de fosfato.'},
 pseudomonas:{name:'Pseudomonas',color:'#b9f36f',slot:'competição',description:'Sideróforos removem proteção dependente de ferro.'},
 isr:{name:'PGPB indutora ISR',color:'#d9ef88',slot:'resistência',description:'Carrega o pulso de resistência sistêmica induzida.'},
 trichoderma:{name:'Trichoderma',color:'#8df0a8',slot:'biocontrole',description:'Micoparasitismo ativo contra barreiras fúngicas.'}
});
export const RESOURCES=Object.freeze({
 phosphate:{name:'Fósforo liberado',color:'#ffd173'},
 iron:{name:'Ferro',color:'#99abc7'},
 carbon:{name:'Exsudato',color:'#86efad'},
 nitrogen:{name:'Nitrogênio assimilável',color:'#d5b4ff'}
});
export const ENEMY_TYPES=Object.freeze({
 spore:{name:'Esporo oportunista',color:'#ff8297',radius:14,health:2,speed:96,score:12,damage:4,fungal:true,cost:1},
 fungalHypha:{name:'Colônia fúngica invasora',color:'#d85d9d',radius:23,health:8,speed:44,score:42,damage:8,fungal:true,cost:3},
 oomycete:{name:'Propágulo de oomiceto',color:'#7b6cff',radius:17,health:5,speed:74,score:30,damage:6,cost:2},
 nematode:{name:'Nematódeo fitoparasita',color:'#ffbe71',radius:16,health:6,speed:82,score:34,damage:4,cost:2},
 bacterialColony:{name:'Colônia bacteriana patogênica',color:'#ef625c',radius:21,health:7,speed:52,score:38,damage:6,cost:3},
 ironArmored:{name:'Competidor protegido por Fe',color:'#ffad67',radius:23,health:9,armor:100,speed:55,score:62,damage:8,cost:3},
 rootLatcher:{name:'Parasita aderente da rizosfera',color:'#c4f36a',radius:15,health:4,speed:88,score:26,damage:0,cost:2}
});
export const STATUS_TYPES=Object.freeze({
 infection:{name:'Infecção fúngica',color:'#ff82ba',description:'reduz a regeneração do biofilme'},
 slow:{name:'Zona encharcada',color:'#7b8cff',description:'reduz a mobilidade'},
 drain:{name:'Nematódeo aderido',color:'#ffbe71',description:'drena N e exsudatos'},
 toxin:{name:'Toxina bacteriana',color:'#ff6c63',description:'reduz a cadência e pausa o biofilme'}
});
export const BIOMES=Object.freeze({
 organic:{name:'Rizosfera rica em exsudatos',top:'#0c3024',bottom:'#04110d',accent:'#86efad'},
 mineral:{name:'Horizonte mineral',top:'#172921',bottom:'#080d0b',accent:'#ffd173'},
 wet:{name:'Microporo encharcado',top:'#102c2f',bottom:'#030e11',accent:'#7fd2ff'},
 compacted:{name:'Solo compactado',top:'#241e18',bottom:'#0c0907',accent:'#ffad67'}
});
