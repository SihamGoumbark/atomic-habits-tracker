# Architecture & Conception ‚Äî Atomic Habits Tracker

Ce document pr√©sente l'architecture technique, la mod√©lisation UML et la conception de la base de donn√©es (Merise) de l'application **Atomic Habits Tracker**, align√©es sur l'impl√©mentation r√©elle (Laravel 11 & React 18).

---

## 1. Architecture Technique & Choix d'Optimisation

L'application repose sur une architecture **3-Tiers d√©coupl√©e (Client-Serveur RESTful)** :

* **Couche Pr√©sentation (Frontend ‚Äî React 18 / Vite / Tailwind CSS) :** Single Page Application (SSA) communiquant via Axios avec jeton Bearer (`Laravel Sanctum`). Elle int√®gre un **hydratage initial group√©** (`GET /api/bootstrap`) coupl√© √† un cache local (`sessionStorage`) et une mise √† jour optimiste de l'interface (*Optimistic UI*) pour une navigation instantan√©e.
* **Couche M√©tier (Backend ‚Äî Laravel 11) :** API REST s√©curis√©e par **Laravel Sanctum**, structur√©e selon le pattern MVC (Routes API ‚ÜÇ Contr√¥leurs REST ‚ÜÇ Mod√®les Eloquent).
* **Couche Persistance (Base de donn√©es ‚Äî MySQL) :** Sch√©ma relationnel normalis√© avec contraintes d'int√©grit√© r√©f√©rentielle (`ON DELETE CASCADE` / `SET NULL`), indexation sur les dates (`completed_date`) et contraintes d'unicit√© composites (`(habit_id, completed_date)` et `(user_id, entry_date)`).

```mermaid
flowchart LR
    subgraph Client["Couche Pr√©sentation (Navigateur)"]
        SPA["SPA React 18 (Vite + Tailwind)\n‚Ä¢ Cache sessionStorage\nËÄ¢ Optimistic UI"]
    end

    subgraph Server["Couche M√©tier (Serveur PHP)"]
        API["API REST Laravel 11\n‚Ä¢ Auth Laravel Sanctum\nËÄ¢ Contr√¥leurs MVC\n‚Ä¢ Eloquent ORM"]
    end

    subgraph Database["Couche Persistance"]
        DB[("qMySQL\nSch√©ma normalis√©")]
    end

    SPA <-->|"HTTPS / JSON (Bearer Token)"| API
    API <-->|"PDO / SQL"| DB
```

---

## 2. Mod√©lisation UML

### 2.1 Diagramme de Cas d'Utilisation (Use Case)

```mermaid
flowchart LR
    User(("Utilisateur"))

    subgraph System["Syst√®me : Atomic Habits Tracker"]
        UC1("S'inscrire / Se connecter / Se d√©connecter (Sanctum)")
        UC2("G√©rer ses Identit√©s cibles (CRUD)")
        UC3("Cr√©er & G√©rer ses Bonnes Habitudes (4 Lois)")
        UC4("Valider une habitude (Compl√®te ou R√®gle des 2 min)")
        UC5("G√©rer & √âliminer ses Mauvaises Habitudes (4 Lois invers√©es)")
        UC6("Consulter le Tableau de bord analytique (Heatmap, Streaks, Never Miss Twice)")
        UC7("R√©diger le Journal quotidien (Humeur, √ânergie, Gratitude, Focus)")
        UC8("Explorer la biblioth√®que de Citations")
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8

    UC3 .->|"<<extend>>"| UC2
    UC4 .->|"<<include>>"| UC6
```

### 2.2 Diagramme de Classes

```mermaid
classDiagram
    direction TB

    class User {
        +bigint id
        +string name
        +string email
        +timestamp email_verified_at
        +string password
        +string remember_token
        +register()
        +login()
        +logout()
    }

    class Identity {
        +bigint id
        +bigint user_id
        +string title
        +text description
        +string color
        +string icon
    }

    class Habit {
        +bigint id
        +bigint user_id
        +bigint identity_id
        +string title
        +string two_minute_version
        +time cue_time
        +string cue_location
        +string stack_after_habit
        +string reward_note
        +json frequency
        +int current_streak
        +int best_streak
        +boolean missed_yesterday
        +boolean is_active
        +toggleCompletion()
    }

    class HabitLog {
        +bigint id
        +bigint habit_id
        +bigint user_id
        +date completed_date
        +enum completion_type
        +text notes
    }

    class BadHabit {
        +bigint id
        +bigint user_id
        +string name
        +string invisible
        +string unattractive
        +string difficult
        +string unsatisfying
    }

    class JournalEntry {
        +bigint id
        +bigint user_id
        +date entry_date
        +tinyint mood_score
        +tinyint energy_level
        +text gratitude_text
        +text daily_reflection
        +string tomorrow_focus
    }

    User "1" --> "0..*" Identity : d√©finit
    User "1" --> "0..*" Habit : poss√®de
    User "1" --> "0..*" HabitLog : enregistre
    User "1" --> "0..*" BadHabit : neutralise
    User "1" --> "0..*" JournalEntry : r√©dige
    Identity "0..1" --> "0..*" Habit : motive
    Habit "1" --> "0..*" HabitLog : trace
```

### 2.3 Diagrammes de S√©quence

#### A. Authentification & Hydratage Initial (`/api/bootstrap`)
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant R as "React (SSA)"
    participant A as "Laravel API (Sanctum)"
    participant DB as MySQL

    U->>R: Saisit email & mot de passe
    R->>A: POST /api/login
    A->>DB: V√©rifie identifiants (table users)
    DB-->>A: Utilisateur valide
    A->>DB: Cr√©e jeton (personal_access_tokens)
    A-->>R: 200 OK (token + user)
    R->>R: Stocke token (localStorage)
    R->>A: GET /api/bootstrap (Bearer Token)
    A->>DB: Charge identities, habits, bad_habits, entries (14j)
    DB-->>A: Donn√©es agr√©g√©es
    A-->>R: 200 OK (JSON complet)
    R->>R: Hydrate cache sessionStorage & affiche Dashboard
```

#### B. Validation d'une Habitude (`POST /api/habits/{habit}/toggle`)
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant R as "React (SPA)"
    participant A as HabitController
    participant DB as MySQL

    U->>R: Clique sur "Valider" (full) ou "2 min" (two_minute)
    R->>R: Mise √† jour optimiste (UI + sessionStorage)
    R->>A: POST /api/habits/{habit}/toggle
    A->>DB: Recherche log pour (habit_id, date du jour)
    alt Log absent (Validation)
        A->>DB: INSERT INTO habit_logs (completion_type)
        A->>DB: Met √† jour current_streak, best_streak & missed_yesterday = false
    else Log pr√©sent (Annulation)
        A->>DB: DELETE FROM habit_logs
        A->>DB: Recalcule current_streak
    end
    DB-->>A: Habitude mise √† jour
    A->>R: 200 OK (JSON habit + stats)
    R->>R: Synchronise cache local
```

#### C. Enregistrement du Journal Quotidien (`POST /api/journal`)
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant R as "React (Journal)"
    participant A as JournalController
    participant DB
    U->>R: Remplit mood_score, energy_level, gratitude, reflection, tomorrow_focus
    R->>A: POST /api/journal (Bearer Token)
    A->>DB: updateOrCreate(['user_id', 'entry_date'])
    DB-->>A: Entr√©e sauvegard√©e
    A-->>R: 200 OK (JournalEntry)
    R->>R: Met √† jour l'historique & graphique hebdomadaire
```

---

## 3. Mod√©lisation Merise (MCD, MLD, MPD)

### 3.1 Mod√®le Conceptuel de Donn√©es (MCD)=
```mermaid
erDiagram
    UTILISATEUR ||--o{b‘»LB¢&L:ñfñÊóB ¢UDîƒï4DUU"«¬“÷˜≤Ñ$ïETDR¢'˜7<:ÜFR ¢UDîƒï4DUU"«¬“÷˜≤ƒÙuÙÑ$ïETDR¢&VÁ&Vvó7G&R ¢UDîƒï4DUU"«¬“÷˜≤‘Udï4UÙÑ$ïETDR¢&ÊWWG&∆ó6R ¢UDîƒï4DUU"«¬“÷˜≤TÂE$TUÙ§ıU$‰¬¢',:ñFñvR ¢îDTÂDïDR∆Ú“÷˜∂Ñ$ïETDR¢&÷˜FófR ¢Ñ$ïETDR«¬“÷˜≤ƒÙuÙÑ$ïETDR¢'G&6R †¢UDîƒï4DUU"∞¢&ñvñÁBñB∞¢7G&ñÊrÊ÷P¢7G&ñÊrV÷ñ¿¢7G&ñÊr77v˜&@¢–¢îDTÂDïDR∞¢&ñvñÁBñB∞¢7G&ñÊrFóF∆P¢FWáBFW67&óFñˆ‡¢7G&ñÊr6ˆ∆˜ ¢7G&ñÊrñ6ˆ‡¢–¢Ñ$ïETDR∞¢&ñvñÁBñB∞¢7G&ñÊrFóF∆P¢7G&ñÊrGvıˆ÷ñÁWFU˜fW'6ñˆ‡¢Fñ÷R7VU˜Fñ÷P¢7G&ñÊr7VUˆ∆ˆ6Fñˆ‡¢7G&ñÊr7F6µˆgFW%ˆÜ&ó@¢7G&ñÊr&Wv&EˆÊ˜FP¢ß6ˆ‚g&WVVÊ7ê¢ñÁB7W'&VÁE˜7G&V∞¢ñÁB&W7E˜7G&V∞¢&ˆˆ∆V‚÷ó76VE˜ñW7FW&Fê¢&ˆˆ∆V‚ó5ˆ7FófP¢–¢ƒÙuÙÑ$ïETDR∞¢&ñvñÁBñB∞¢FFR6ˆ◊∆WFVEˆFFP¢VÁV“6ˆ◊∆WFñˆÂ˜GóP¢FWáBÊ˜FW0¢–¢‘Udï4UÙÑ$ïETDR∞¢&ñvñÁBñB∞¢7G&ñÊrÊ÷P¢7G&ñÊrñÁfó6ñ&∆P¢7G&ñÊrVÊGG&7FófP¢7G&ñÊrFñffñ7V«@¢7G&ñÊrVÁ6Fó6gññÊp¢–¢TÂE$TUÙ§ıU$‰¬∞¢&ñvñÁBñB∞¢FFRVÁG'ïˆFFP¢FñÁññÁB÷ˆˆE˜66˜&P¢FñÁññÁBVÊW&wïˆ∆WfV¿¢FWáBw&FóGVFU˜FWá@¢FWáBFñ«ï˜&Vf∆V7Fñˆ‡¢7G&ñÊrFˆ÷˜'&˜uˆfˆ7W0¢–¶ †¢2222„"÷ˆL:Ü∆R∆ˆvóVRFRFˆÊÏ:ñW2Ñ‘ƒBê†¢¢¢ßW6W'2¢¢Ç¢¶ñF¢¢¬Ê÷V¬V÷ñ∆¬V÷ñ≈˜fW&ñfñVEˆF¬77v˜&F¬&V÷V÷&W%˜Fˆ∂VÊ¬7&VFVEˆF¬WFFVEˆFê¢¢¢¶ñFVÁFóFñW2¢¢Ç¢¶ñF¢¢¬7W6W%ˆñF¬FóF∆V¬FW67&óFñˆÊ¬6ˆ∆˜&¬ñ6ˆÊ¬7&VFVEˆF¬WFFVEˆFê¢¢¢¶Ü&óG2¢¢Ç¢¶ñF¢¢¬7W6W%ˆñF¬6ñFVÁFóGïˆñF¬FóF∆V¬Gvıˆ÷ñÁWFU˜fW'6ñˆÊ¬7VU˜Fñ÷V¬7VUˆ∆ˆ6FñˆÊ¬7F6µˆgFW%ˆÜ&óF¬&Wv&EˆÊ˜FV¬g&WVVÊ7ñ¬7W'&VÁE˜7G&V∂¬&W7E˜7G&V∂¬÷ó76VE˜ñW7FW&Fñ¬ó5ˆ7FófV¬7&VFVEˆF¬WFFVEˆFê¢¢¢¶Ü&óEˆ∆ˆw2¢¢Ç¢¶ñF¢¢¬6Ü&óEˆñF¬7W6W%ˆñF¬6ˆ◊∆WFVEˆFFV¬6ˆ◊∆WFñˆÂ˜GóV¬Ê˜FW6¬7&VFVEˆF¬WFFVEˆFê¢¢¢¶&EˆÜ&óG2¢¢Ç¢¶ñF¢¢¬7W6W%ˆñF¬Ê÷V¬ñÁfó6ñ&∆V¬VÊGG&7FófV¬Fñffñ7V«F¬VÁ6Fó6gññÊv¬7&VFVEˆF¬WFFVEˆFê¢¢¢¶¶˜W&Ê≈ˆVÁG&ñW2¢¢Ç¢¶ñF¢¢¬7W6W%ˆñF¬VÁG'ïˆFFV¬÷ˆˆE˜66˜&V¬VÊW&wïˆ∆WfV∆¬w&FóGVFU˜FWáF¬Fñ«ï˜&Vf∆V7FñˆÊ¬Fˆ÷˜'&˜uˆfˆ7W6¬7&VFVEˆF¬WFFVEˆFê†¢2222„2÷ˆL:Ü∆Ráó6óVRFRFˆÊÏ:ñW2Ñ’B(	B◊ï5¬ê†ß¬F&∆R¬6Ã:í&ñ÷ó&R¬6Ã:ó28óG&Ê|:á&W2b,:Üv∆W2¬ñÊFWÇb6ˆÁG&ñÁFW2BuVÊñ6óL:í¿ß¬¢“““¬¢“““¬¢“““¬¢“““¿ß¬¢¶W6W'6¢¢¬ñFÜ$îtîÂBTÂ4ît‰TFí¬(	B¬¬T‰ïTRÜV÷ñ¬ñ¿ß¬¢¶ñFVÁFóFñW6¢¢¬ñFÜ$îtîÂBTÂ4ît‰TFí¬W6W%ˆñF(i"W6W'2ÜñBñÜÙ‚DTƒUDR444DUÇó¬(	B¬¿ß¬¢¶Ü&óG6¢¢¬ñFÜ$îtîÂBTÂ4ît‰TFí¬W6W%ˆñF(i"W6W'2ÜñBñÜÙ‚DTƒUDR444DVì∆'#ÊñFVÁFóGïˆñF(i"ñFVÁFóFñW2ÜñBñÜÙ‚DTƒUDR4UBÂTƒ∆¬ÁV∆∆&∆Rí¬L:ñfWG2¢7W'&VÁE˜7G&V≥”¬&W7E˜7G&V≥”¬÷ó76VE˜ñW7FW&Fì÷f«6V¬ó5ˆ7FófS◊G'VV¿ß¬¢¶Ü&óEˆ∆ˆw6¢¢¬ñFÜ$îtîÂBTÂ4ît‰TFí¬Ü&óEˆñF(i"Ü&óG2ÜñBñÜÙ‚DTƒUDR444DVì∆'#ÊW6W%ˆñF(i"W6W'2ÜñBñÜÙ‚DTƒUDR444DVí¬î‰DUÇÜ6ˆ◊∆WFVEˆFFRñ∆'#ÊT‰ïTRÜÜ&óEˆñB¬6ˆ◊∆WFVEˆFFRñC∆'#ÊTÂT“ÇvgV∆¬r¬wGvıˆ÷ñÁWFRrñ¿ß¬¢¶&EˆÜ&óG6¢¢¬ñFÜ$îtîÂBTÂ4ît‰TFí¬W6W%ˆñF(i"W6W'2ÜñBñÜÙ‚DTƒUDR444DVí¬6ˆ∆ˆÊÊW2FW2B∆ˆó2ñÁfW'<:ñW2ÁV∆∆&∆R¿ß¬¢¶¶˜W&Ê≈ˆVÁG&ñW6¢¢¬ñFÜ$îtîÂBTÂ4ît‰TFí¬W6W%ˆñF(i"W6W'2ÜñBñÜÙ‚DTƒUDR444DVí¬T‰ïTRáW6W%ˆñB¬VÁG'ïˆFFRñ∆'#ÊDîÂîîÂF˜W"÷ˆˆE˜66˜&VWBVÊW&wïˆ∆WfV∆É:Rí¿†¢““–†¢22B‚6'Fˆw&ÜñRFW2VÊGˆñÁG2í$U5BÜ&˜WFW2ˆíÁáê†ß¬‹:óFÜˆFR¬VÊGˆñÁB¬6<:á2¬6ˆÁG,;F∆WW"¬,;F∆R¿ß¬¢“““¬¢“““¬¢“““¬¢“““¬¢“““¿ß¬ı5F¬ˆí˜&Vvó7FW&¬V&∆ñ2¬WFÑ6ˆÁG&ˆ∆∆W$&Vvó7FW&¬7,:ñFñˆ‚FR6ˆ◊FR≤:ñ÷ó76ñˆ‚Fˆ∂V‚6Ê7GV“¿ß¬ı5F¬ˆíˆ∆ˆvñÊ¬V&∆ñ2¬WFÑ6ˆÁG&ˆ∆∆W$∆ˆvñÊ¬WFÜVÁFñfñ6Fñˆ‚≤:ñ÷ó76ñˆ‚Fˆ∂V‚6Ê7GV“¿ß¬tUF¬ˆíˆ÷V¬&˜L:ñ|:í¬WFÑ6ˆÁG&ˆ∆∆W$÷V¬&ˆfñ¬FR¬wWFñ∆ó6FWW"6ˆÊÊV7L:í¿ß¬ı5F¬ˆíˆ∆ˆv˜WF¬&˜L:ñ|:í¬WFÑ6ˆÁG&ˆ∆∆W$∆ˆv˜WF¬,:ófˆ6Fñˆ‚GRFˆ∂V‚6˜W&ÁB¿ß¬tUF¬ˆíˆ&ˆ˜G7G&¬&˜L:ñ|:í¬6∆˜7W&R˜Fñ÷ó<:ñR¬,:ñ6Ü&vV÷VÁBw&˜W:íÜñFVÁFóL:ó2¬Ü&óGVFW2¬÷Wfó6W2Ü&óGVFW2¬¶˜W&Ê¬í¿ß¬tUBıı5BıUBÙDT∆¬ˆíˆñFVÁFóFñW6¬&˜L:ñ|:í¬ñFVÁFóGî6ˆÁG&ˆ∆∆W&¬5%TBFW2ñFVÁFóL:ó26ñ&∆W2¿ß¬tUBıı5BıUBÙDT∆¬ˆíˆÜ&óG6¬&˜L:ñ|:í¬Ü&óD6ˆÁG&ˆ∆∆W&¬5%TBFW2&ˆÊÊW2Ü&óGVFW2ÉB∆ˆó2í¿ß¬ı5F¬ˆíˆÜ&óG2˜∂Ü&óG“˜Fˆvv∆V¬&˜L:ñ|:í¬Ü&óD6ˆÁG&ˆ∆∆W$Fˆvv∆V¬f∆ñFFñˆ‚ˆÊÁV∆Fñˆ‚V˜FñFñVÊÊRÜgV∆∆ÚGvıˆ÷ñÁWFVíWB6∆7V¬FR7G&V≤¿ß¬tUBıı5BÙDT∆¬ˆíˆ&B÷Ü&óG6¬&˜L:ñ|:í¬&DÜ&óD6ˆÁG&ˆ∆∆W&¬vW7Fñˆ‚FW2÷Wfó6W2Ü&óGVFW2ÉB∆ˆó2ñÁfW'<:ñW2í¿ß¬tUBıı5F¬ˆíˆ¶˜W&Ê∆¬&˜L:ñ|:í¬¶˜W&Êƒ6ˆÁG&ˆ∆∆W&¬∆V7GW&RWBW6W'BV˜FñFñV‚ÜWFFT˜$7&VFVíGR¶˜W&Ê¬¿ß¬tUF¬ˆíˆF6Ü&ˆ&F¬&˜L:ñ|:í¬F6Ü&ˆ&D6ˆÁG&ˆ∆∆W$7FG6¬6∆7V¬FW2µó2¬ÜVF÷3¢¬f˜FW2"ñFVÁFóL:íWB∆W'FW2§ÊWfW"÷ó72Gvñ6R¢¿†¢““–†¢22R‚‹:óFÜˆFˆ∆ˆvñRbvW7Fñˆ‚FR&ˆ¶WBÑvñ∆RÚvóBê†¢¢¢§&ˆ6ÜRvñ∆RÑóL:ó&FófRbñÊ7,:ñ÷VÁF∆Rí¢¢¢L:ófV∆˜V÷VÁBL:ñ6˜W:íV‚BóL:ó&FñˆÁ26˜W'FW2É‚6ˆ6∆RWFÇbñFVÁFóL:ó2(i""‚<Y7W"‹:óFñW"&ˆÊÊW2Ü&óGVFW2b7G&V∑2(i"2‚÷Wfó6W2Ü&óGVFW2¬¶˜W&Ê¬b6óFFñˆÁ2(i"B‚F6Ü&ˆ&BÊ«óFóVRb˜Fñ÷ó6Fñˆ‚ˆ&ˆ˜G7G&í‡¢¢¢§vW7Fñˆ‚FRfW'6ñˆÁ2ÑvóBbvóDáV"í¢¢¢<:ó&Fñˆ‚7G&ñ7FRVÁG&R∆'&Ê6ÜRFRL:ófV∆˜V÷VÁBÜFWfíWB∆'&Ê6ÜR7F&∆RFR&ˆGV7Fñˆ‚Ü÷ñÊí‡¢¢¢•f∆ñFFñˆ‚í¢¢¢FW7G2fˆÊ7FñˆÊÊV«2FW2&˜WFW2$U5BWBFW26ˆFW2FR7FGWBÖEEÜ#¬#¬C¬C#&í‡