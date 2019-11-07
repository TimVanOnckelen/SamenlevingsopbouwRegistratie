function createVrijwilligers() {


    for (let i = 0, p = Promise.resolve(); i < 100; i++) {

        let location = Math.floor(Math.random() * 5) + 1;
        let Name = faker.name.findName();


        sprLib.list("lijstVrijwilligers").create({
            "Title": Name,
            "VolledigeNaam": Name,
            "LocatieId": location,
            "statuut": "deelnemer"


        }).then(function (objItem) {



        });

        if (i == 100) {
            resolve();
            alert("Done");
        }

    }

}

function addMoments() {

    for (let i = 0, p = Promise.resolve(); i < 500; i++) {

        let location = Math.floor(Math.random() * 5) + 1;
        let project = Math.floor(Math.random() * 7) + 1;
        let activiteit = Math.floor(Math.random() * 3) + 1;

        let title = [
            "Creatieve activiteiten", "Buurtfotografen", "Boekdelen", "Buurtkoor", "Taal-oor", "Twee-spraak", "Diverse", "Deelmaaltijd"
        ];

        let formArray = {
            projectId: project,
            activiteitId: activiteit,
            locatieId: location,
            datum: randomDate(new Date(2018, 0, 1), new Date()),
            Title: title[project],
            vrijwilligers: ["results"][1, 251, 156, 626, 45],
            aantalVrijwilligers: "5",
            aantalInitiatiefnemers: "1",
            deelnemers: ["results"][1011, 1012, 1013, 1014, 1015, 1016],
            aantalDeelnemers: "6",
            aantalOplossingact: "2",
            aantalPartners: "0"
        };

        sprLib.list("lijstMomenten").create(formArray).then(function (objItem) {



        }).catch(function (strErr) { console.error(strErr); });
   

    }
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
