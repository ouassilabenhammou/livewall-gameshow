## LiveWall Gameshow – Interactief contactformulier

Dit is een schoolproject gemaakt voor het bedrijf **Livewall.nl**.  
Het doel is om een **interactief, game-achtig contactformulier** te bouwen voor hun website.

### Wat is de Gameshow?
In plaats van een saai contactformulier komt de bezoeker van Livewall in een **gameshow-wereld** terecht.  
De speler wordt welkom geheten door een **presentator** die hem stap voor stap meeneemt. De presentator vraagt op een speelse manier naar belangrijke gegevens, zoals naam, e-mailadres, type project en eventuele wensen.

Tijdens de ervaring gebruiken we een **rad** dat helpt om het **budget** voor het gekozen project zichtbaar te maken. Dit maakt het invullen minder zakelijk en meer als een spel.

Aan het einde ziet de speler een duidelijk **overzicht van alle ingevulde informatie**. Hier kan alles nog rustig worden nagekeken en aangepast. Pas wanneer de speler tevreden is, worden de gegevens verstuurd naar **Livewall**, zodat zij contact kunnen opnemen over het project.

### Wat gaan we later nog toevoegen?
- **Puntensysteem of beloning**  
  We onderzoeken nog hoe we **punten, scores of een beloning** kunnen toevoegen om de ervaring nog leuker te maken.

- **Meer animaties en effecten**  
  We willen later **meer animaties**, overgangen en kleine details toevoegen om de gameshow nog levendiger te maken.

### Doel van het project
- **Contact opnemen leuker maken** dan een standaard formulier  
- **Spelervaring combineren met serieuze input** (zoals budget en contactgegevens)  
- **Leren** over webontwikkeling, UX, animaties en interactieve interfaces

### Technologie
Dit project is een **Next.js webapplicatie** gebouwd met moderne webtechnieken.

- **Framework**: Next.js  
- **Taal**: TypeScript (uitgebreidere versie van JavaScript, met types)  
- **UI-bibliotheek**: React  
- **3D en gameshow-wereld**:  
  - **Three.js** (3D-engine)  
  - **React Three Fiber** (React-laag bovenop Three.js)  
  - **@react-three/drei** (handige helpers voor 3D)  
  - **@react-three/postprocessing** (extra visuele effecten)  
- **Styling**: CSS met globale styles in `globals.css` (project is voorbereid op gebruik van Tailwind CSS via de tooling)  
- **Linting**: ESLint met de **Next.js core-web-vitals + TypeScript** configuratie (controleert de code op fouten en afspraken)

We richten ons vooral op:
- **React-componenten**: onderdelen zoals de gameshow-ervaring, het rad, het publiek en interface-elementen  
- **State** (toestand): bijhouden wat de speler heeft ingevuld en in welke fase van de experience hij zit  
- **3D-wereld en camera**: een podium-achtige omgeving met camera-bewegingen om het gevoel van een echte gameshow te geven  
- **Animaties en overgangen**: om de overgang tussen vragen en schermen vloeiend en speels te maken  

### Project starten (voor ontwikkelaars)
Voordat je begint, zorg dat je **Node.js** en **npm** op je computer hebt staan.

1. **Repository clonen of downloaden**
   - Via Git: `git clone <url-van-dit-project>`
   - Of download als ZIP en pak uit

2. **Benodigde packages installeren**
   - Open een terminal in de map van het project
   - Voer uit: `npm install`

3. **Ontwikkelserver starten**
   - Voer uit: `npm run dev`
   - Open daarna de getoonde link in je browser (meestal `http://localhost:3000`)

4. **Project builden voor productie (optioneel)**
   - Voer uit: `npm run build`
   - De geoptimaliseerde bestanden komen in de `.next`-map, klaar om op een server te plaatsen.

### Structuur (globaal)
- `src/` – broncode van de applicatie
  - `app/` – Next.js App Router
    - `page.tsx` – startpagina van de applicatie; laadt de `GameshowExperience` component
    - `layout.tsx` – algemene layout en HTML-structuur
    - `globals.css` – globale stijlen voor de hele applicatie
    - `favicon.ico` – favicon van de site
  - `components/` – losse React-componenten voor de gameshow
    - `GameshowExperience.tsx` – hoofdcomponent van de gameshow-ervaring (3D-scene, logica, stappen)
    - `Audience.tsx` – component voor het publiek / sfeer in de scene
    - `PixelCharacter.tsx` – het (pixel)personage van de speler of presentator
    - `CameraRig.tsx` – logica voor de camera-bewegingen in de 3D-wereld