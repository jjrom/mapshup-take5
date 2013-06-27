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
                    searchService: c["general"].rootUrl + "/ws/search.php?q=",
                    sitesUrl: c["general"].rootUrl + "/ws/getSites.php?language=",
                    downloadUrl: c["general"].rootUrl + "/ws/getProductFile.php",
                    licenseUrl: c["general"].rootUrl + "/license.txt",
                    addUserDownloadUrl: c["general"].rootUrl + "/ws/take5AddDownload.php",
                    aboutUrl: "http://www.ptsc.fr/fr/produits/spot4-take5"
                }
            }
    );

})(window.M.Config);