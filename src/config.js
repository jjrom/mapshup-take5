(function(c) {

    /*
     * Update configuration options
     * 
     * Should be changed to match target server
     */
    c["general"].rootUrl = "http://spirit.cnes.fr/take5";
    c["general"].serverRootUrl = c["general"].rootUrl + "/s";
    c["general"].proxyUrl = null;

    /*
     * !! DO NOT EDIT UNDER THIS LINE !!
     */
    c["general"].themePath = "/js/mapshup/theme/default";
    c["general"].displayContextualMenu = false;
    c["general"].displayCoordinates = false;
    c["general"].displayScale = false;
    c["general"].timeLine = {
        enable: false
    };
    c["general"].overviewMap = "closed";
    c.remove("layers", "Streets");
    c.remove("layers", "Satellite");
    c.remove("layers", "Relief");
    c.remove("layers", "MapQuest OSM");
    c.remove("layers", "OpenStreetMap");
    c.add("layers", {
        type: "Bing",
        title: "Satellite",
        key: "AmraZAAcRFVn6Vbxk_TVhhVZNt66x4_4SV_EvlfzvRC9qZ_2y6k1aNsuuoYS0UYy",
        bingType: "Aerial"
    });
    c.extend("Navigation", {
        position: 'nw',
        orientation: 'h',
        home: null
    });
    
    c.add("plugins",
            {
                name: "Take5",
                options: {
                    searchService: "http://spirit.cnes.fr/take5/ws/search.php?q=",
                    sitesUrl: "http://spirit.cnes.fr/take5/ws/getSites.php?language=",
                    archivesUrl: "http://spirit.cnes.fr/take5/archives",
                    downloadUrl: "http://spirit.cnes.fr/take5/ws/getProductFile.php",
                    licenseUrl: c["general"].rootUrl + "/license.txt",
                    addUserDownloadUrl: "http://spirit.cnes.fr/take5/ws/take5AddDownload.php",
                    aboutUrl: "http://www.cesbio.ups-tlse.fr/multitemp/?page_id=1822",
                    theiaUrl: "http://www.ptsc.fr/"
                }
            }
    );

})(window.M.Config);
