<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="WebPartPageExpansion" content="full" />
        <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script> 
        <script type="text/javascript" src="/_layouts/15/sp.js"></script> 
    <!-- Add your CSS styles to the following file -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.5/css/bulma.min.css" integrity="sha256-vK3UTo/8wHbaUn+dTQD0X6dzidqc5l7gczvH+Bnowwk=" crossorigin="anonymous" />
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/multi-select/0.9.12/css/multi-select.min.css" integrity="sha256-l4jVb17uOpLwdXQPDpkVIxW9LrCRFUjaZHb6Fqww/0o=" crossorigin="anonymous" />
    <script src="https://kit.fontawesome.com/342a2c41d4.js" crossorigin="anonymous"></script>

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/gitbrent/SpRestLib@1.9.0/dist/sprestlib.bundle.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js" integrity="sha256-4iQZ6BVL4qNKlQ27TExEhBN1HFPvAvAMbFavKKosSWQ=" crossorigin="anonymous"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.10/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.10/js/select2.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/3.1.0/mustache.min.js" integrity="sha256-MPgtcamIpCPKRRm1ppJHkvtNBAuE71xcOM+MmQytXi8=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="../Scripts/App.js"></script>

</asp:Content>


<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div class="container" id="registratie-app-container">
    <nav class="navbar" id="navigation">
          <div class="navbar-brand">
            <a class="navbar-item" href="#">
                <img src="https://samenlevingsopbouw-antwerpenstad.be/wp-content/themes/samenlevingsopbouw/dist/img/logo-antwerpen.svg" width="112" height="28">
            </a>

            <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>

        </div>
        <div class="navbar-start">
            <a class="navbar-item" href="#">Registreren & overzicht</a>
            <a class="navbar-item" href="#">Woordenboek</a>
            <a class="navbar-item" href="#">Hoe werkt dit?</a>
        </div>
        <div class="navbar-end">
            <div class="buttons">
                <div class="button is-primary">
                    Welkom, <span data-content="user.name"></span>
                </div>
            </div>
        </div>
    </nav>

        <div class="columns">

          <div id="registratie-container" class="column">
              <h2 class="title is-3">Nieuwe registratie</h2>
                            <div class="field">       
                    <label for="project">Project</label>
                    <select class="select2" id="project" name="project"  class="input is-medium" required="required">
                        <option></option>
                    </select>
                </div>
                <div class="field">
                    <label for="activiteit">Activiteit</label>
                    <select class="select2" id="activiteit" name="activiteit"  class="input is-medium" required="required">
                        <option></option>
                    </select>      
                </div>
                <div class="field">
                    <label for="locatie">Locatie</label>
                    <select class="select2" id="locatie" name="locatie"  class="input is-medium" required="required">
                        <option></option>
                    </select>
                </div>
                <div class="field">
                    <label for="datum">Datum</label>
                    <input id="datum" class="input is-medium" type="date" value="" name="datum" required="required" />
                </div>
                <div class="field">
                    <label for="titel">Titel</label>
                    <input id="titel"  class="input is-medium" type="text" value="" name="titel" required="required" />
                </div>
                  <div class="field">       
                    <label for="vrijwilligers">Vrijwilligers</label>
                    <select class="select2" multiple="multiple" id="vrijwilligers" name="vrijwilligers">
                        <option></option>
                    </select>
                   <label for="aantalVrijwilligers">Aantal Vrijwilligers</label>
                   <input type="number" id="aantalVrijwilligers" name="aantalVrijwilligers" value="0" class="input is-medium" />
                   <label for="aantalDeelnemers">Aantal Initiatief nemers</label>
                   <input type="number" id="aantalInitatiefnemers" name="aantalInitatiefnemers" value="0" class="input is-medium" />
                </div>
              <div class="field">       
                    <label for="deelnemers">Deelnemers</label>
                    <select class="select2" multiple="multiple" id="deelnemers" name="deelnemers">
                        <option></option>
                    </select>
                   <label for="aantalDeelnemers">Aantal Deelnemers</label>
                   <input type="number" id="aantalDeelnemers" name="aantalDeelnemers" value="0" class="input is-medium" />
                   <label for="aantalOplossingact">Aantal opl. actoren</label>
                   <input type="number" id="aantalOplossingact" name="aantalOplossingact" value="0" class="input is-medium" />
                </div>
          <div class="field">       
                    <label for="partners">Partners</label>
                    <select class="select2" multiple="multiple" id="partners" name="partners">
                        <option></option>
                    </select>
                   <label for="aantalPartners">Aantal Partners</label>
                   <input type="number" id="aantalPartners" name="aantalPartners" value="0" class="input is-medium" />
    
                </div>

                    <a id="saveRegistratie" class="button is-large is-primary">Opslaan</a>
                    
            </div>

              <div id="registratie-info" class="column is-three-quarters">
                  <h2 class="title is-3">Overzicht registraties</h2>
                    <div id="momenten-filters">
                                    <label for="filter-locatie">Filter locatie</label>
                                      <select class="select2" id="filter-locatie" name="filter-locatie"  class="input is-medium">
                                       <option value="">Alle locaties</option>
                                    </select>

                                                <div class="field">       
                    <label for="filer-project">Filter project</label>
                    <select class="select2" id="filter-project" name="filter-project" class="input is-medium">
                        <option value="">Alle projecten</option>
                    </select>
                </div>

                    </div>
                    <div id="momenten-overview">
                        <ul>
                        </ul>
                    </div>
              </div>


    </div>

   

</asp:Content>
