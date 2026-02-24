// ==============================================
// COMPREHENSIVE GOA LOCATION DATA
// Districts → Talukas → Villages / Municipalities
// ==============================================

export interface GoaLocationData {
    [district: string]: {
        [taluka: string]: string[];
    };
}

const GOA_LOCATIONS: GoaLocationData = {
    "North Goa": {
        "Tiswadi": [
            "Panaji", "Old Goa", "Dona Paula", "Bambolim", "Santa Cruz",
            "Merces", "Taleigao", "Caranzalem", "Carambolim", "Agassaim",
            "Corlim", "Goa Velha", "Chorao", "Jua", "Navelim",
            "Neura", "Opa", "Azossim", "Batim", "Borda",
            "Chimbel", "Cumbarjua", "St. Estevam", "St. Cruz", "Ilhas",
            "Ribandar", "Goltim", "Siridao", "Curca", "Pilar",
            "St. Inez", "Miramar", "Kadamba"
        ],
        "Bardez": [
            "Mapusa", "Calangute", "Candolim", "Porvorim", "Siolim",
            "Anjuna", "Vagator", "Arpora", "Reis Magos", "Colvale",
            "Guirim", "Moira", "Pomburpa", "Bastora", "Aldona",
            "Nachinola", "Parra", "Saligao", "Pilerne", "Sangolda",
            "Serula", "Assagao", "Nerul", "Penha de Franca", "Verla-Canca",
            "Alto Porvorim", "Salvador do Mundo", "Ucassaim", "Oxel",
            "Tivim", "Camurlim", "Sirgao", "Socorro"
        ],
        "Pernem": [
            "Pernem", "Arambol", "Mandrem", "Morjim", "Agarwado",
            "Tuem", "Ibrampur", "Corgao", "Dargalim", "Ozrim",
            "Torxem", "Virnora", "Kasarpal", "Dhargal", "Harmal",
            "Parsem", "Tamboxem", "Alorna", "Chopdem", "Paliem",
            "Querim", "Varkhand", "Mopa"
        ],
        "Bicholim": [
            "Bicholim", "Sanquelim", "Mayem", "Naroa", "Mulgao",
            "Karapur-Sarvan", "Sarvona", "Velguem", "Sirigao", "Lamgao",
            "Honda", "Cudnem", "Amona", "Piligao", "Navelim",
            "Latambarcem", "Menkurem", "Surla", "Advalpal"
        ],
        "Sattari": [
            "Valpoi", "Birondem", "Pissurlem", "Honda", "Kalay",
            "Keri", "Morlem", "Savoi Verem", "Pale", "Thane",
            "Velus", "Dabem", "Guleli", "Nagargao", "Poriem",
            "Querim", "Sonal", "Usgao", "Codal", "Bhironda"
        ],
        "Ponda": [
            "Ponda", "Farmagudi", "Shiroda", "Marcaim", "Priol",
            "Curti", "Bandora", "Kavlem", "Khandepar", "Talaulim",
            "Borim", "Durbhat", "Bhoma", "Quela", "Betim",
            "Orgao", "Savoi Verem", "Tisk", "Madkai", "Kundaim",
            "Bethora", "Usgao", "Veling", "Queula", "Mardol"
        ]
    },
    "South Goa": {
        "Salcete": [
            "Margao", "Fatorda", "Verna", "Colva", "Navelim",
            "Benaulim", "Carmona", "Chinchinim", "Cuncolim", "Curtorim",
            "Loutolim", "Majorda", "Raia", "Sarzora", "Seraulim",
            "Telaulim", "Varca", "Cavelossim", "Dramapur", "Guirdolim",
            "Aquem", "Betalbatim", "Cansaulim", "Nuvem", "Orlim",
            "Rachol", "Macasana", "Sirlim", "Velim", "Assolna",
            "Camurlim", "Davorlim", "Sao Jose de Areal"
        ],
        "Mormugao": [
            "Vasco da Gama", "Dabolim", "Chicalim", "Cansaulim", "Sancoale",
            "Bogmalo", "Cortalim", "Zuarinagar", "Issorcim", "Chicolna",
            "Mormugao", "Headland Sada", "Mangor Hill", "Baina"
        ],
        "Quepem": [
            "Quepem", "Curchorem", "Balli", "Ambaulim", "Xeldem",
            "Assolda", "Barcem", "Avedem", "Fatorpa", "Morpirla",
            "Molcornem", "Cacora", "Pirla", "Dhaveli", "Quitol",
            "Adnem", "Sirvoi", "Cavelossim"
        ],
        "Canacona": [
            "Canacona", "Palolem", "Agonda", "Loliem", "Gaondongrim",
            "Cola", "Cotigao", "Poinguinim", "Shristhal", "Mashem",
            "Khola", "Sadolxem", "Rajbag", "Cabo de Rama", "Maxem",
            "Partagali", "Talpona"
        ],
        "Sanguem": [
            "Sanguem", "Netravali", "Curdi", "Rivona", "Uguem",
            "Quisconda", "Calem", "Timblo", "Colem", "Dabal",
            "Mollem", "Zambaulim", "Sigao", "Darbandora", "Kirlapal",
            "Bhati", "Sancordem", "Verlem", "Costi", "Sulcorna"
        ],
        "Dharbandora": [
            "Dharbandora", "Mollem", "Kulem", "Kirlapal-Dabem",
            "Dudhsagar", "Ponda", "Bolcornem", "Sancordem", "Collem",
            "Caranzol", "Nirankal"
        ]
    }
};

export default GOA_LOCATIONS;
