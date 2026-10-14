/* =====================================================================================
   FAWIWE · V145 · Grillas reales año por año (1950–1999)
   Formato: año | Equipo:auto(1-5):Piloto 1,Piloto 2 | ...
   Se usan los dos pilotos que más corrieron para cada equipo esa temporada.
   ===================================================================================== */
const V15_HIST_RAW = `
1950|Alfa Romeo:5.0:Giuseppe Farina,Juan Manuel Fangio|Scuderia Ferrari:3.8:Alberto Ascari,Luigi Villoresi|Talbot-Lago:3.0:Louis Rosier,Philippe Étancelin|Maserati:2.6:Louis Chiron,Prince Bira|Gordini:1.8:Robert Manzon,Maurice Trintignant
1951|Alfa Romeo:4.9:Juan Manuel Fangio,Giuseppe Farina|Scuderia Ferrari:4.8:Alberto Ascari,José Froilán González|Talbot-Lago:2.8:Louis Rosier,Philippe Étancelin|Gordini:1.8:Robert Manzon,Maurice Trintignant|BRM:1.7:Reg Parnell,Peter Walker|Maserati:1.5:Onofre Marimón,Prince Bira
1952|Scuderia Ferrari:5.0:Alberto Ascari,Giuseppe Farina|Gordini:3.0:Jean Behra,Robert Manzon|Maserati:2.8:José Froilán González,Felice Bonetto|HWM:2.0:Peter Collins,Lance Macklin|Cooper Car Company:2.0:Mike Hawthorn,Alan Brown|Connaught:1.6:Dennis Poore,Eric Thompson
1953|Scuderia Ferrari:5.0:Alberto Ascari,Giuseppe Farina|Maserati:4.6:Juan Manuel Fangio,José Froilán González|Gordini:2.6:Jean Behra,Maurice Trintignant|HWM:2.0:Peter Collins,Lance Macklin|Cooper Car Company:1.8:Ken Wharton,Alan Brown|Connaught:1.7:Roy Salvadori,Prince Bira
1954|Mercedes-Benz:5.0:Juan Manuel Fangio,Karl Kling|Scuderia Ferrari:4.4:José Froilán González,Mike Hawthorn|Maserati:3.8:Stirling Moss,Onofre Marimón|Lancia:3.0:Alberto Ascari,Luigi Villoresi|Gordini:2.2:Jean Behra,André Pilette
1955|Mercedes-Benz:5.0:Juan Manuel Fangio,Stirling Moss|Scuderia Ferrari:3.8:Maurice Trintignant,Giuseppe Farina|Maserati:3.6:Jean Behra,Roberto Mieres|Lancia:3.4:Alberto Ascari,Eugenio Castellotti|Vanwall:1.8:Mike Hawthorn,Ken Wharton|Gordini:1.6:Robert Manzon,Hernando da Silva Ramos|Connaught:1.5:Tony Brooks,Jack Fairman
1956|Scuderia Ferrari:5.0:Juan Manuel Fangio,Peter Collins|Maserati:4.2:Stirling Moss,Jean Behra|Vanwall:3.0:Harry Schell,Maurice Trintignant|BRM:2.2:Mike Hawthorn,Tony Brooks|Connaught:1.6:Ron Flockhart,Archie Scott Brown|Gordini:1.5:Robert Manzon,Hernando da Silva Ramos
1957|Maserati:5.0:Juan Manuel Fangio,Jean Behra|Vanwall:4.4:Stirling Moss,Tony Brooks|Scuderia Ferrari:4.0:Mike Hawthorn,Peter Collins|BRM:2.4:Ron Flockhart,Les Leston|Cooper Car Company:2.0:Jack Brabham,Roy Salvadori
1958|Vanwall:4.8:Stirling Moss,Tony Brooks|Scuderia Ferrari:4.5:Mike Hawthorn,Peter Collins|Cooper Car Company:3.8:Jack Brabham,Roy Salvadori|BRM:3.0:Jean Behra,Harry Schell|Maserati:2.6:Juan Manuel Fangio,Masten Gregory|Team Lotus:2.0:Graham Hill,Cliff Allison
1959|Cooper Car Company:5.0:Jack Brabham,Bruce McLaren|Scuderia Ferrari:4.0:Tony Brooks,Phil Hill|BRM:3.4:Jo Bonnier,Harry Schell|Team Lotus:2.4:Graham Hill,Innes Ireland|Aston Martin:1.6:Roy Salvadori,Carroll Shelby
1960|Cooper Car Company:5.0:Jack Brabham,Bruce McLaren|Team Lotus:4.2:Innes Ireland,John Surtees|Scuderia Ferrari:3.4:Phil Hill,Wolfgang von Trips|BRM:2.8:Graham Hill,Jo Bonnier|Aston Martin:1.4:Roy Salvadori,Maurice Trintignant
1961|Scuderia Ferrari:5.0:Phil Hill,Wolfgang von Trips|Team Lotus:3.8:Jim Clark,Innes Ireland|Porsche:3.2:Dan Gurney,Jo Bonnier|Cooper Car Company:3.0:Jack Brabham,Bruce McLaren|BRM:2.4:Graham Hill,Tony Brooks
1962|BRM:5.0:Graham Hill,Richie Ginther|Team Lotus:4.8:Jim Clark,Trevor Taylor|Cooper Car Company:3.6:Bruce McLaren,Tony Maggs|Porsche:3.2:Dan Gurney,Jo Bonnier|Scuderia Ferrari:3.0:Phil Hill,Giancarlo Baghetti|Lola:2.6:John Surtees,Roy Salvadori
1963|Team Lotus:5.0:Jim Clark,Trevor Taylor|BRM:4.2:Graham Hill,Richie Ginther|Brabham:3.6:Jack Brabham,Dan Gurney|Scuderia Ferrari:3.4:John Surtees,Lorenzo Bandini|Cooper Car Company:3.0:Bruce McLaren,Tony Maggs
1964|Scuderia Ferrari:4.8:John Surtees,Lorenzo Bandini|BRM:4.6:Graham Hill,Richie Ginther|Team Lotus:4.6:Jim Clark,Peter Arundell|Brabham:3.8:Jack Brabham,Dan Gurney|Cooper Car Company:3.0:Bruce McLaren,Phil Hill
1965|Team Lotus:4.8:Jim Clark,Mike Spence|BRM:4.0:Graham Hill,Jackie Stewart|Scuderia Ferrari:3.6:John Surtees,Lorenzo Bandini|Brabham:3.4:Jack Brabham,Dan Gurney|Cooper Car Company:3.0:Bruce McLaren,Jochen Rindt|Honda F1:2.0:Richie Ginther,Ronnie Bucknum
1966|Brabham:5.0:Jack Brabham,Denny Hulme|Scuderia Ferrari:4.0:Lorenzo Bandini,Mike Parkes|Cooper Car Company:3.8:John Surtees,Jochen Rindt|BRM:3.4:Graham Hill,Jackie Stewart|Team Lotus:3.0:Jim Clark,Peter Arundell|Eagle Racing:2.0:Dan Gurney,Bob Bondurant|Honda F1:2.0:Richie Ginther,Ronnie Bucknum|McLaren:1.8:Bruce McLaren,Chris Amon
1967|Brabham:5.0:Denny Hulme,Jack Brabham|Team Lotus:4.6:Jim Clark,Graham Hill|Scuderia Ferrari:3.6:Chris Amon,Lorenzo Bandini|Cooper Car Company:3.4:Jochen Rindt,Pedro Rodríguez|BRM:3.0:Jackie Stewart,Mike Spence|Eagle Racing:2.6:Dan Gurney,Bruce McLaren
1968|Team Lotus:4.8:Graham Hill,Jackie Oliver|Matra:4.6:Jackie Stewart,Jean-Pierre Beltoise|McLaren:4.4:Bruce McLaren,Denny Hulme|Scuderia Ferrari:3.8:Chris Amon,Jacky Ickx|Brabham:3.0:Jack Brabham,Jochen Rindt|BRM:3.0:Pedro Rodríguez,Richard Attwood|Honda F1:2.6:John Surtees,Jo Schlesser|Cooper Car Company:2.0:Lucien Bianchi,Vic Elford
1969|Matra:5.0:Jackie Stewart,Jean-Pierre Beltoise|Brabham:4.2:Jacky Ickx,Jack Brabham|Team Lotus:3.8:Jochen Rindt,Graham Hill|McLaren:3.6:Bruce McLaren,Denny Hulme|Scuderia Ferrari:2.6:Chris Amon,Pedro Rodríguez|BRM:2.4:John Surtees,Jackie Oliver
1970|Team Lotus:4.8:Jochen Rindt,Emerson Fittipaldi|Scuderia Ferrari:4.6:Jacky Ickx,Clay Regazzoni|Tyrrell:3.6:Jackie Stewart,François Cevert|March:3.4:Chris Amon,Jo Siffert|BRM:3.4:Pedro Rodríguez,Jackie Oliver|Brabham:3.4:Jack Brabham,Rolf Stommelen|McLaren:3.2:Denny Hulme,Peter Gethin|Matra:2.8:Jean-Pierre Beltoise,Henri Pescarolo|Surtees:2.0:John Surtees,Derek Bell
1971|Tyrrell:5.0:Jackie Stewart,François Cevert|BRM:4.0:Jo Siffert,Peter Gethin|Scuderia Ferrari:3.8:Jacky Ickx,Clay Regazzoni|March:3.4:Ronnie Peterson,Nanni Galli|McLaren:3.0:Denny Hulme,Peter Revson|Team Lotus:2.8:Emerson Fittipaldi,Reine Wisell|Matra:2.4:Chris Amon,Jean-Pierre Beltoise|Surtees:2.2:John Surtees,Rolf Stommelen|Brabham:2.2:Graham Hill,Tim Schenken
1972|Team Lotus:5.0:Emerson Fittipaldi,Dave Walker|Tyrrell:4.6:Jackie Stewart,François Cevert|McLaren:4.2:Denny Hulme,Peter Revson|Scuderia Ferrari:4.0:Jacky Ickx,Clay Regazzoni|BRM:2.8:Jean-Pierre Beltoise,Peter Gethin|Surtees:2.6:Mike Hailwood,Tim Schenken|Brabham:2.4:Graham Hill,Carlos Reutemann|March:2.2:Ronnie Peterson,Niki Lauda
1973|Tyrrell:5.0:Jackie Stewart,François Cevert|Team Lotus:4.8:Emerson Fittipaldi,Ronnie Peterson|McLaren:4.2:Denny Hulme,Peter Revson|Brabham:3.2:Carlos Reutemann,Wilson Fittipaldi|Scuderia Ferrari:2.8:Jacky Ickx,Arturo Merzario|BRM:2.6:Clay Regazzoni,Niki Lauda|Shadow Racing Cars:2.2:Jackie Oliver,George Follmer|Surtees:2.0:Mike Hailwood,Carlos Pace
1974|McLaren:4.8:Emerson Fittipaldi,Denny Hulme|Scuderia Ferrari:4.8:Clay Regazzoni,Niki Lauda|Tyrrell:4.0:Jody Scheckter,Patrick Depailler|Team Lotus:3.6:Ronnie Peterson,Jacky Ickx|Brabham:3.6:Carlos Reutemann,Carlos Pace|Shadow Racing Cars:2.4:Jean-Pierre Jarier,Tom Pryce|March:2.4:Hans-Joachim Stuck,Vittorio Brambilla|BRM:2.2:Jean-Pierre Beltoise,Henri Pescarolo|Surtees:1.8:Jochen Mass,Derek Bell
1975|Scuderia Ferrari:5.0:Niki Lauda,Clay Regazzoni|Brabham:4.2:Carlos Reutemann,Carlos Pace|McLaren:4.0:Emerson Fittipaldi,Jochen Mass|Hesketh:3.4:James Hunt,Brett Lunger|Tyrrell:3.4:Jody Scheckter,Patrick Depailler|Shadow Racing Cars:2.8:Jean-Pierre Jarier,Tom Pryce|Team Lotus:2.6:Ronnie Peterson,Jacky Ickx|March:2.6:Vittorio Brambilla,Lella Lombardi
1976|Scuderia Ferrari:4.8:Niki Lauda,Clay Regazzoni|McLaren:4.7:James Hunt,Jochen Mass|Tyrrell:3.6:Jody Scheckter,Patrick Depailler|Team Lotus:3.4:Mario Andretti,Gunnar Nilsson|Brabham:3.0:Carlos Reutemann,Carlos Pace|March:2.8:Ronnie Peterson,Vittorio Brambilla|Shadow Racing Cars:2.4:Tom Pryce,Jean-Pierre Jarier
1977|Scuderia Ferrari:4.8:Niki Lauda,Carlos Reutemann|Team Lotus:4.6:Mario Andretti,Gunnar Nilsson|McLaren:4.0:James Hunt,Jochen Mass|Brabham:3.4:John Watson,Hans-Joachim Stuck|Tyrrell:3.2:Ronnie Peterson,Patrick Depailler|Shadow Racing Cars:2.4:Alan Jones,Riccardo Patrese
1978|Team Lotus:5.0:Mario Andretti,Ronnie Peterson|Scuderia Ferrari:4.2:Carlos Reutemann,Gilles Villeneuve|Brabham:4.0:Niki Lauda,John Watson|Tyrrell:3.2:Patrick Depailler,Didier Pironi|Wolf Racing:3.2:Jody Scheckter,Keke Rosberg|McLaren:2.8:James Hunt,Patrick Tambay|Arrows:2.4:Riccardo Patrese,Rolf Stommelen|Shadow Racing Cars:2.0:Hans-Joachim Stuck,Clay Regazzoni
1979|Scuderia Ferrari:5.0:Jody Scheckter,Gilles Villeneuve|Williams:4.6:Alan Jones,Clay Regazzoni|Ligier:4.0:Jacques Laffite,Patrick Depailler|Team Lotus:3.4:Mario Andretti,Carlos Reutemann|Renault F1:3.4:Jean-Pierre Jabouille,René Arnoux|Brabham:2.8:Niki Lauda,Nelson Piquet|Tyrrell:2.8:Didier Pironi,Jean-Pierre Jarier|McLaren:2.4:John Watson,Patrick Tambay|Wolf Racing:2.0:James Hunt,Keke Rosberg|Arrows:2.0:Riccardo Patrese,Jochen Mass
1980|Williams:5.0:Alan Jones,Carlos Reutemann|Ligier:4.4:Jacques Laffite,Didier Pironi|Brabham:4.2:Nelson Piquet,Héctor Rebaque|Renault F1:4.0:René Arnoux,Jean-Pierre Jabouille|Team Lotus:2.6:Elio de Angelis,Mario Andretti|Tyrrell:2.4:Jean-Pierre Jarier,Derek Daly|McLaren:2.4:John Watson,Alain Prost|Arrows:2.4:Riccardo Patrese,Jochen Mass|Alfa Romeo:2.2:Bruno Giacomelli,Patrick Depailler|Scuderia Ferrari:2.0:Jody Scheckter,Gilles Villeneuve
1981|Williams:5.0:Alan Jones,Carlos Reutemann|Brabham:4.8:Nelson Piquet,Héctor Rebaque|Renault F1:4.2:Alain Prost,René Arnoux|Scuderia Ferrari:3.4:Gilles Villeneuve,Didier Pironi|Ligier:3.2:Jacques Laffite,Jean-Pierre Jabouille|McLaren:3.2:John Watson,Andrea de Cesaris|Team Lotus:2.6:Elio de Angelis,Nigel Mansell|Arrows:2.4:Riccardo Patrese,Siegfried Stohr|Alfa Romeo:2.4:Mario Andretti,Bruno Giacomelli|Tyrrell:2.0:Eddie Cheever,Michele Alboreto
1982|Scuderia Ferrari:4.8:Gilles Villeneuve,Didier Pironi|McLaren:4.4:Niki Lauda,John Watson|Williams:4.4:Keke Rosberg,Derek Daly|Renault F1:4.4:Alain Prost,René Arnoux|Brabham:3.6:Nelson Piquet,Riccardo Patrese|Team Lotus:3.0:Elio de Angelis,Nigel Mansell|Tyrrell:2.8:Michele Alboreto,Brian Henton|Ligier:2.4:Jacques Laffite,Eddie Cheever|Alfa Romeo:2.4:Andrea de Cesaris,Bruno Giacomelli|Toleman:1.6:Derek Warwick,Teo Fabi
1983|Scuderia Ferrari:4.8:Patrick Tambay,René Arnoux|Brabham:4.6:Nelson Piquet,Riccardo Patrese|Renault F1:4.6:Alain Prost,Eddie Cheever|Williams:3.6:Keke Rosberg,Jacques Laffite|McLaren:3.6:Niki Lauda,John Watson|Alfa Romeo:2.8:Andrea de Cesaris,Mauro Baldi|Team Lotus:2.8:Elio de Angelis,Nigel Mansell|Tyrrell:2.4:Michele Alboreto,Danny Sullivan|Toleman:2.2:Derek Warwick,Bruno Giacomelli|Arrows:2.0:Marc Surer,Chico Serra
1984|McLaren:5.0:Niki Lauda,Alain Prost|Scuderia Ferrari:3.8:Michele Alboreto,René Arnoux|Team Lotus:3.6:Elio de Angelis,Nigel Mansell|Brabham:3.6:Nelson Piquet,Teo Fabi|Renault F1:3.4:Patrick Tambay,Derek Warwick|Williams:3.2:Keke Rosberg,Jacques Laffite|Toleman:2.6:Ayrton Senna,Johnny Cecotto|Alfa Romeo:2.2:Riccardo Patrese,Eddie Cheever|Ligier:2.0:Andrea de Cesaris,François Hesnault|Arrows:1.8:Marc Surer,Thierry Boutsen
1985|McLaren:5.0:Alain Prost,Niki Lauda|Williams:4.6:Keke Rosberg,Nigel Mansell|Scuderia Ferrari:4.4:Michele Alboreto,Stefan Johansson|Team Lotus:4.2:Ayrton Senna,Elio de Angelis|Brabham:3.0:Nelson Piquet,Marc Surer|Ligier:2.8:Jacques Laffite,Andrea de Cesaris|Renault F1:2.6:Patrick Tambay,Derek Warwick|Arrows:2.4:Thierry Boutsen,Gerhard Berger|Tyrrell:1.8:Martin Brundle,Stefan Bellof|Toleman:1.8:Teo Fabi,Piercarlo Ghinzani
1986|Williams:5.0:Nigel Mansell,Nelson Piquet|McLaren:4.6:Alain Prost,Keke Rosberg|Team Lotus:4.2:Ayrton Senna,Johnny Dumfries|Scuderia Ferrari:3.6:Michele Alboreto,Stefan Johansson|Benetton:3.2:Gerhard Berger,Teo Fabi|Ligier:3.0:Jacques Laffite,René Arnoux|Tyrrell:2.4:Martin Brundle,Philippe Streiff|Lola:2.0:Alan Jones,Patrick Tambay|Brabham:2.0:Riccardo Patrese,Derek Warwick|Arrows:1.8:Thierry Boutsen,Christian Danner|Minardi:1.4:Andrea de Cesaris,Alessandro Nannini
1987|Williams:5.0:Nelson Piquet,Nigel Mansell|McLaren:4.4:Alain Prost,Stefan Johansson|Team Lotus:4.0:Ayrton Senna,Satoru Nakajima|Scuderia Ferrari:4.0:Gerhard Berger,Michele Alboreto|Benetton:3.4:Thierry Boutsen,Teo Fabi|Arrows:2.4:Derek Warwick,Eddie Cheever|Brabham:2.4:Riccardo Patrese,Andrea de Cesaris|Tyrrell:2.2:Jonathan Palmer,Philippe Streiff|Ligier:1.6:René Arnoux,Piercarlo Ghinzani|Minardi:1.4:Alessandro Nannini,Adrián Campos
1988|McLaren:5.0:Ayrton Senna,Alain Prost|Scuderia Ferrari:3.6:Gerhard Berger,Michele Alboreto|Benetton:3.2:Thierry Boutsen,Alessandro Nannini|Williams:3.0:Nigel Mansell,Riccardo Patrese|Team Lotus:2.8:Nelson Piquet,Satoru Nakajima|March:2.6:Ivan Capelli,Maurício Gugelmin|Arrows:2.4:Derek Warwick,Eddie Cheever|Tyrrell:1.6:Jonathan Palmer,Julian Bailey|Ligier:1.4:René Arnoux,Stefan Johansson|Minardi:1.4:Luis Pérez-Sala,Pierluigi Martini
1989|McLaren:5.0:Ayrton Senna,Alain Prost|Williams:4.2:Thierry Boutsen,Riccardo Patrese|Scuderia Ferrari:4.2:Nigel Mansell,Gerhard Berger|Benetton:3.4:Alessandro Nannini,Johnny Herbert|Tyrrell:2.8:Jean Alesi,Jonathan Palmer|Team Lotus:2.6:Nelson Piquet,Satoru Nakajima|Arrows:2.4:Derek Warwick,Eddie Cheever|Brabham:2.4:Martin Brundle,Stefano Modena|March:2.0:Ivan Capelli,Maurício Gugelmin|Minardi:2.0:Pierluigi Martini,Luis Pérez-Sala
1990|McLaren:5.0:Ayrton Senna,Gerhard Berger|Scuderia Ferrari:4.8:Alain Prost,Nigel Mansell|Benetton:4.0:Nelson Piquet,Alessandro Nannini|Williams:4.0:Thierry Boutsen,Riccardo Patrese|Tyrrell:2.8:Jean Alesi,Satoru Nakajima|March:2.2:Ivan Capelli,Maurício Gugelmin|Team Lotus:2.0:Derek Warwick,Martin Donnelly|Arrows:1.8:Michele Alboreto,Alex Caffi|Brabham:1.6:Stefano Modena,David Brabham|Minardi:1.6:Pierluigi Martini,Paolo Barilla|Ligier:1.6:Philippe Alliot,Nicola Larini
1991|McLaren:5.0:Ayrton Senna,Gerhard Berger|Williams:4.8:Nigel Mansell,Riccardo Patrese|Scuderia Ferrari:3.8:Alain Prost,Jean Alesi|Benetton:3.4:Nelson Piquet,Roberto Moreno|Jordan Grand Prix:2.8:Andrea de Cesaris,Bertrand Gachot|Tyrrell:2.4:Satoru Nakajima,Stefano Modena|Minardi:1.8:Pierluigi Martini,Gianni Morbidelli|Ligier:1.6:Thierry Boutsen,Érik Comas|Brabham:1.6:Martin Brundle,Mark Blundell|Team Lotus:1.6:Mika Häkkinen,Johnny Herbert|Footwork:1.4:Michele Alboreto,Alex Caffi
1992|Williams:5.0:Nigel Mansell,Riccardo Patrese|McLaren:4.2:Ayrton Senna,Gerhard Berger|Benetton:3.8:Michael Schumacher,Martin Brundle|Scuderia Ferrari:2.8:Jean Alesi,Ivan Capelli|Team Lotus:2.8:Mika Häkkinen,Johnny Herbert|Ligier:2.4:Thierry Boutsen,Érik Comas|Tyrrell:2.0:Olivier Grouillard,Andrea de Cesaris|Footwork:2.0:Michele Alboreto,Aguri Suzuki|Jordan Grand Prix:1.6:Stefano Modena,Maurício Gugelmin|Minardi:1.6:Gianni Morbidelli,Christian Fittipaldi|March:1.4:Karl Wendlinger,Paul Belmondo
1993|Williams:5.0:Alain Prost,Damon Hill|McLaren:4.2:Ayrton Senna,Michael Andretti|Benetton:4.2:Michael Schumacher,Riccardo Patrese|Scuderia Ferrari:3.2:Jean Alesi,Gerhard Berger|Ligier:2.8:Martin Brundle,Mark Blundell|Team Lotus:2.4:Johnny Herbert,Alessandro Zanardi|Sauber Clásico:2.4:JJ Lehto,Karl Wendlinger|Footwork:2.2:Derek Warwick,Aguri Suzuki|Jordan Grand Prix:2.0:Rubens Barrichello,Thierry Boutsen|Minardi:1.6:Christian Fittipaldi,Fabrizio Barbazza|Tyrrell:1.4:Ukyo Katayama,Andrea de Cesaris
1994|Benetton:4.6:Michael Schumacher,Jos Verstappen|Williams:4.5:Damon Hill,David Coulthard|Scuderia Ferrari:3.6:Gerhard Berger,Jean Alesi|McLaren:3.2:Mika Häkkinen,Martin Brundle|Jordan Grand Prix:2.8:Rubens Barrichello,Eddie Irvine|Ligier:2.8:Olivier Panis,Éric Bernard|Tyrrell:2.6:Ukyo Katayama,Mark Blundell|Sauber Clásico:2.2:Heinz-Harald Frentzen,Andrea de Cesaris|Footwork:2.0:Christian Fittipaldi,Gianni Morbidelli|Minardi:1.6:Pierluigi Martini,Michele Alboreto|Team Lotus:1.4:Johnny Herbert,Pedro Lamy
1995|Benetton:5.0:Michael Schumacher,Johnny Herbert|Williams:4.8:Damon Hill,David Coulthard|Scuderia Ferrari:4.0:Jean Alesi,Gerhard Berger|McLaren:3.0:Mika Häkkinen,Mark Blundell|Ligier:2.8:Olivier Panis,Martin Brundle|Jordan Grand Prix:2.6:Rubens Barrichello,Eddie Irvine|Sauber Clásico:2.4:Heinz-Harald Frentzen,Jean-Christophe Boullion|Tyrrell:1.8:Mika Salo,Ukyo Katayama|Footwork:1.8:Gianni Morbidelli,Taki Inoue|Minardi:1.6:Luca Badoer,Pedro Lamy
1996|Williams:5.0:Damon Hill,Jacques Villeneuve|Scuderia Ferrari:4.2:Michael Schumacher,Eddie Irvine|Benetton:4.0:Jean Alesi,Gerhard Berger|McLaren:3.6:Mika Häkkinen,David Coulthard|Jordan Grand Prix:2.8:Rubens Barrichello,Martin Brundle|Ligier:2.6:Olivier Panis,Pedro Diniz|Sauber Clásico:2.6:Heinz-Harald Frentzen,Johnny Herbert|Tyrrell:2.0:Mika Salo,Ukyo Katayama|Footwork:1.8:Jos Verstappen,Ricardo Rosset|Minardi:1.6:Pedro Lamy,Giancarlo Fisichella
1997|Williams:5.0:Jacques Villeneuve,Heinz-Harald Frentzen|Scuderia Ferrari:4.6:Michael Schumacher,Eddie Irvine|McLaren:4.0:Mika Häkkinen,David Coulthard|Benetton:3.8:Jean Alesi,Gerhard Berger|Jordan Grand Prix:3.0:Giancarlo Fisichella,Ralf Schumacher|Prost Grand Prix:2.8:Olivier Panis,Shinji Nakano|Sauber Clásico:2.4:Johnny Herbert,Nicola Larini|Arrows:2.2:Damon Hill,Pedro Diniz|Stewart Grand Prix:2.2:Rubens Barrichello,Jan Magnussen|Tyrrell:1.8:Mika Salo,Jos Verstappen|Minardi:1.4:Ukyo Katayama,Jarno Trulli
1998|McLaren:5.0:Mika Häkkinen,David Coulthard|Scuderia Ferrari:4.6:Michael Schumacher,Eddie Irvine|Williams:3.6:Jacques Villeneuve,Heinz-Harald Frentzen|Jordan Grand Prix:3.4:Damon Hill,Ralf Schumacher|Benetton:3.4:Giancarlo Fisichella,Alexander Wurz|Sauber Clásico:2.6:Jean Alesi,Johnny Herbert|Arrows:2.2:Mika Salo,Pedro Diniz|Stewart Grand Prix:2.2:Rubens Barrichello,Jos Verstappen|Prost Grand Prix:1.8:Olivier Panis,Jarno Trulli|Tyrrell:1.6:Ricardo Rosset,Toranosuke Takagi|Minardi:1.4:Shinji Nakano,Esteban Tuero
1999|McLaren:4.8:Mika Häkkinen,David Coulthard|Scuderia Ferrari:4.8:Michael Schumacher,Eddie Irvine|Jordan Grand Prix:4.0:Heinz-Harald Frentzen,Damon Hill|Stewart Grand Prix:3.4:Johnny Herbert,Rubens Barrichello|Williams:3.0:Ralf Schumacher,Alessandro Zanardi|Benetton:3.0:Giancarlo Fisichella,Alexander Wurz|Prost Grand Prix:2.4:Olivier Panis,Jarno Trulli|Sauber Clásico:2.2:Jean Alesi,Pedro Diniz|Arrows:1.8:Pedro de la Rosa,Toranosuke Takagi|BAR Honda:1.8:Jacques Villeneuve,Ricardo Zonta|Minardi:1.4:Marc Gené,Luca Badoer
`;
// rating de cada piloto (si no figura, se usa el que ya tenía el juego o 74)
const V15_RATING = {
  "Juan Manuel Fangio": 97, "Alberto Ascari": 94, "Giuseppe Farina": 90, "Stirling Moss": 95, "José Froilán González": 87, "Luigi Villoresi": 84,
  "Mike Hawthorn": 88, "Peter Collins": 86, "Tony Brooks": 87, "Jean Behra": 84, "Maurice Trintignant": 82, "Jack Brabham": 90, "Bruce McLaren": 86,
  "Phil Hill": 86, "Graham Hill": 88, "Jim Clark": 97, "John Surtees": 88, "Dan Gurney": 88, "Wolfgang von Trips": 85, "Richie Ginther": 82,
  "Innes Ireland": 80, "Jo Bonnier": 78, "Jackie Stewart": 94, "Denny Hulme": 86, "Jochen Rindt": 91, "Lorenzo Bandini": 82, "Chris Amon": 85,
  "Jacky Ickx": 88, "Pedro Rodríguez": 84, "Jo Siffert": 83, "Emerson Fittipaldi": 91, "Clay Regazzoni": 85, "François Cevert": 86,
  "Ronnie Peterson": 89, "Niki Lauda": 95, "James Hunt": 90, "Jody Scheckter": 88, "Carlos Reutemann": 87, "Mario Andretti": 90,
  "Patrick Depailler": 82, "Carlos Pace": 82, "Gilles Villeneuve": 90, "Alan Jones": 87, "Jacques Laffite": 84, "Didier Pironi": 85,
  "René Arnoux": 84, "Nelson Piquet": 91, "Alain Prost": 96, "Keke Rosberg": 87, "John Watson": 82, "Riccardo Patrese": 85,
  "Nigel Mansell": 91, "Elio de Angelis": 83, "Michele Alboreto": 84, "Patrick Tambay": 82, "Ayrton Senna": 98, "Gerhard Berger": 86,
  "Thierry Boutsen": 82, "Stefan Johansson": 79, "Derek Warwick": 81, "Teo Fabi": 79, "Alessandro Nannini": 82, "Jean Alesi": 85,
  "Michael Schumacher": 97, "Damon Hill": 88, "Mika Häkkinen": 92, "David Coulthard": 86, "Johnny Herbert": 81, "Martin Brundle": 82,
  "Rubens Barrichello": 85, "Eddie Irvine": 82, "Heinz-Harald Frentzen": 83, "Jacques Villeneuve": 87, "Olivier Panis": 80,
  "Giancarlo Fisichella": 81, "Ralf Schumacher": 83, "Alexander Wurz": 78, "Jarno Trulli": 80, "Mika Salo": 76, "Karl Wendlinger": 78,
  "Satoru Nakajima": 74, "Eddie Cheever": 77, "Andrea de Cesaris": 76, "Ivan Capelli": 78, "Stefano Modena": 77, "Pierluigi Martini": 75,
  "Mark Blundell": 76, "Ukyo Katayama": 74, "Jos Verstappen": 76, "Pedro Diniz": 70, "Jean-Pierre Beltoise": 80, "Jean-Pierre Jarier": 79,
  "Tom Pryce": 79, "Jochen Mass": 79, "Vittorio Brambilla": 76, "Hans-Joachim Stuck": 78, "Peter Revson": 81, "Mike Hailwood": 79,
  "Jackie Oliver": 75, "Henri Pescarolo": 75, "Jean-Pierre Jabouille": 79, "Mauro Baldi": 72, "Johnny Cecotto": 73
};
const V15_HIST = {};
(function () {
  V15_HIST_RAW.trim().split("\n").forEach(line => {
    const parts = line.trim().split("|"); const y = +parts[0];
    const T = [], D = [];
    parts.slice(1).forEach(p => {
      const [team, car, drivers] = p.split(":");
      T.push([team, +car]);
      drivers.split(",").forEach(n => D.push([n.trim(), 0, 0, team]));
    });
    V15_HIST[y] = { T, D };
  });
})();

// Ferrari 2010-2015: en los datos sus pilotos figuraban como "Ferrari" y el equipo como "Scuderia Ferrari"
(function () {
  try { for (let y = 2010; y <= 2015; y++) (driversByYear[y] || []).forEach(d => { if (d[3] === "Ferrari") d[3] = "Scuderia Ferrari"; }); } catch (e) {}
})();

/* =====================================================================================
   FAWIWE · Prototipo 1.5 · CANTIDAD REAL DE AUTOS POR ÉPOCA
   Hasta ahora cada año tenía solo los equipos de fábrica (en los 60, 10-12 autos). En la
   F1 real largaban muchos más: equipos privados como Rob Walker, Centro Sud, Osella o ATS.
   Acá se suman los privados reales de cada temporada hasta llegar a la grilla típica de ese año.
   Formato de piloto: "Nombre@año" o "Nombre@desde-hasta" (varios tramos con ;).
   ===================================================================================== */
const V18_GRID_TARGET = { 1950: 20, 1951: 20, 1952: 22, 1953: 22, 1954: 20, 1955: 20, 1956: 20, 1957: 18, 1958: 20, 1959: 18, 1960: 20, 1961: 20, 1962: 20, 1963: 20, 1964: 20, 1965: 18, 1966: 18, 1967: 18, 1968: 20, 1969: 16, 1970: 22, 1971: 22, 1972: 24, 1973: 24, 1974: 26, 1975: 24, 1976: 26, 1977: 26, 1978: 24, 1979: 24, 1980: 24, 1981: 24, 1982: 26, 1983: 26, 1984: 26, 1985: 26, 1986: 26, 1987: 26, 1988: 26, 1989: 26, 1990: 26, 1991: 26, 1992: 26, 1993: 26, 1994: 26, 1995: 24, 1996: 22, 1997: 22, 1998: 22, 1999: 22 };
const V18_PRIVATE = [
  // [equipo, auto (1-5), [pilotos]]
  ["ERA", 1.4, ["Bob Gerard@1950-1951", "Cuth Harrison@1950", "Peter Walker@1950"]],
  ["Scuderia Ambrosiana", 1.5, ["David Hampshire@1950", "David Murray@1950-1951", "Reg Parnell@1950"]],
  ["Enrico Platé", 1.6, ["Toulo de Graffenried@1950-1952", "Harry Schell@1951-1952"]],
  ["Ecurie Belge", 1.5, ["Johnny Claes@1950-1953", "André Pilette@1951"]],
  ["Alta", 1.2, ["Geoffrey Crossley@1950", "Joe Kelly@1950-1951"]],
  ["OSCA", 1.6, ["Franco Rol@1951", "Elie Bayol@1952-1953", "Louis Chiron@1953"]],
  ["Escuderia Bandeirantes", 1.4, ["Chico Landi@1952-1953", "Gino Bianco@1952", "Eitel Cantoni@1952"]],
  ["Ecurie Espadon", 1.6, ["Rudi Fischer@1952", "Peter Hirt@1952"]],
  ["Ecurie Ecosse", 1.4, ["David Murray@1952", "Ian Stewart@1953", "Jimmy Stewart@1953"]],
  ["Ecurie Rosier", 1.8, ["Louis Rosier@1952-1956", "Robert Manzon@1954"]],
  ["Ecurie Francorchamps", 1.4, ["Jacques Swaters@1952-1954", "Charles de Tornaco@1952-1953", "Roger Laurent@1952"]],
  ["Gilby Engineering", 1.6, ["Roy Salvadori@1954-1956"]],
  ["Equipe Nationale Belge", 1.6, ["Johnny Claes@1955", "Jacques Swaters@1955-1956", "André Pilette@1956"]],
  ["Maserati privados", 2.0, ["Prince Bira@1954", "Roberto Mieres@1954", "Harry Schell@1954", "Horace Gould@1955-1957", "Bruce Halford@1956-1957", "Luigi Piotti@1956-1957", "Jo Bonnier@1957-1958", "Maria Teresa de Filippis@1958"]],
  ["Equipe Moss", 3.0, ["Stirling Moss@1954"]],
  ["Vanwall", 1.8, ["Peter Collins@1954"]],
  ["HWM", 1.4, ["Lance Macklin@1954"]],
  ["Connaught", 1.6, ["Stuart Lewis-Evans@1957", "Ivor Bueb@1957"]],
  ["Scuderia Centro Sud", 1.8, ["Masten Gregory@1957;1960", "Hans Herrmann@1957-1958", "Ian Burgess@1960-1961", "Lorenzo Bandini@1961;1963", "Moisés Solana@1963-1964", "Giancarlo Baghetti@1964"]],
  ["Rob Walker Racing", 3.0, ["Stirling Moss@1958-1961", "Maurice Trintignant@1958-1959;1962", "Jo Bonnier@1963-1965", "Jo Siffert@1965-1969", "Graham Hill@1970"]],
  ["British Racing Partnership", 1.8, ["Hans Herrmann@1959", "Ivor Bueb@1959", "Innes Ireland@1963-1964", "Jim Hall@1963", "Trevor Taylor@1964"]],
  ["Yeoman Credit Racing", 2.6, ["Tony Brooks@1960", "Chris Bristow@1960", "John Surtees@1961", "Roy Salvadori@1961"]],
  ["Scarab", 1.2, ["Lance Reventlow@1960", "Chuck Daigh@1960"]],
  ["UDT Laystall", 2.0, ["Henry Taylor@1961", "Cliff Allison@1961", "Masten Gregory@1961-1962", "Innes Ireland@1962"]],
  ["Ecurie Maarsbergen", 1.4, ["Carel Godin de Beaufort@1959-1964", "Ben Pon@1962"]],
  ["Reg Parnell Racing", 1.8, ["Chris Amon@1963-1964", "Mike Hailwood@1964", "Richard Attwood@1965", "Innes Ireland@1965", "Mike Spence@1966", "Chris Irwin@1967", "Piers Courage@1968", "Pedro Rodríguez@1969"]],
  ["ATS (Italia)", 1.4, ["Phil Hill@1963", "Giancarlo Baghetti@1963"]],
  ["Scirocco-Powell", 1.0, ["Tony Settember@1963", "Ian Burgess@1963"]],
  ["Siffert Racing Team", 1.5, ["Jo Siffert@1962-1964"]],
  ["DW Racing Enterprises", 1.3, ["Bob Anderson@1963-1967"]],
  ["John Willment Automobiles", 1.3, ["Frank Gardner@1964-1965"]],
  ["Joakim Bonnier Racing Team", 1.4, ["Jo Bonnier@1966-1971"]],
  ["Guy Ligier Racing", 1.2, ["Guy Ligier@1966-1967"]],
  ["Frank Williams Racing Cars", 1.8, ["Piers Courage@1969-1970", "Tim Schenken@1970", "Henri Pescarolo@1971-1972", "Carlos Pace@1972", "Howden Ganley@1973", "Nanni Galli@1973", "Arturo Merzario@1974-1975", "Jacques Laffite@1974-1975", "Jacky Ickx@1976", "Michel Leclère@1976"]],
  ["Antique Automobiles", 1.3, ["Vic Elford@1969"]],
  ["Silvio Moser Racing Team", 1.1, ["Silvio Moser@1968-1970"]],
  ["Matra", 2.6, ["Chris Amon@1972"]],
  ["Tecno", 1.3, ["Nanni Galli@1972", "Derek Bell@1972", "Chris Amon@1973"]],
  ["March", 2.0, ["Jean-Pierre Jarier@1973", "Roger Williamson@1973", "Vittorio Brambilla@1977", "Ian Scheckter@1977", "Alex Ribeiro@1977", "Derek Daly@1981", "Eliseo Salazar@1981", "Jochen Mass@1982", "Raul Boesel@1982", "Ivan Capelli@1987"]],
  ["Hesketh", 2.2, ["James Hunt@1973-1974", "Harald Ertl@1976-1977", "Guy Edwards@1976", "Rupert Keegan@1977", "Divina Galica@1978"]],
  ["Ensign", 1.5, ["Rikky von Opel@1973-1974", "Chris Amon@1975-1976", "Clay Regazzoni@1977;1980", "Patrick Tambay@1977", "Derek Daly@1978", "Patrick Gaillard@1979", "Marc Surer@1979;1981", "Jan Lammers@1980", "Eliseo Salazar@1981", "Roberto Guerrero@1982"]],
  ["Embassy Hill", 1.8, ["Graham Hill@1974-1975", "Rolf Stommelen@1974-1975", "Guy Edwards@1974", "Tony Brise@1975", "Alan Jones@1975"]],
  ["Penske", 2.4, ["Mark Donohue@1974-1975", "John Watson@1975-1976"]],
  ["Parnelli", 2.0, ["Mario Andretti@1974-1976"]],
  ["Surtees", 1.6, ["John Watson@1975", "Alan Jones@1976", "Brett Lunger@1976", "Vittorio Brambilla@1977-1978", "Hans Binder@1977", "Rupert Keegan@1978"]],
  ["Fittipaldi (Copersucar)", 2.2, ["Wilson Fittipaldi@1975", "Emerson Fittipaldi@1976-1980", "Ingo Hoffmann@1976-1977", "Keke Rosberg@1980-1981", "Chico Serra@1981-1982"]],
  ["Ligier", 3.0, ["Jacques Laffite@1976-1978", "Jean-Pierre Jarier@1983", "Raul Boesel@1983", "René Arnoux@1989", "Olivier Grouillard@1989"]],
  ["Wolf Racing", 4.0, ["Jody Scheckter@1977"]],
  ["Renault F1", 2.2, ["Jean-Pierre Jabouille@1977-1978"]],
  ["Williams", 2.2, ["Patrick Nève@1977", "Alan Jones@1978"]],
  ["ATS", 1.5, ["Jean-Pierre Jarier@1977-1978", "Hans Binder@1977", "Jochen Mass@1978", "Hans-Joachim Stuck@1979", "Marc Surer@1980", "Jan Lammers@1980-1981", "Slim Borgudd@1981", "Manfred Winkelhock@1982-1984", "Eliseo Salazar@1982", "Gerhard Berger@1984"]],
  ["Theodore Racing", 1.3, ["Keke Rosberg@1978", "Patrick Tambay@1981", "Marc Surer@1981", "Derek Daly@1982", "Jan Lammers@1982", "Roberto Guerrero@1983", "Johnny Cecotto@1983"]],
  ["Merzario", 1.0, ["Arturo Merzario@1978-1979"]],
  ["Alfa Romeo", 1.5, ["Bruno Giacomelli@1979", "Vittorio Brambilla@1979", "Riccardo Patrese@1985", "Eddie Cheever@1985"]],
  ["Shadow Racing Cars", 1.2, ["Elio de Angelis@1979", "Jan Lammers@1979", "Geoff Lees@1980", "David Kennedy@1980"]],
  ["Osella", 1.4, ["Eddie Cheever@1980", "Beppe Gabbiani@1981", "Jean-Pierre Jarier@1981-1982", "Riccardo Paletti@1982", "Piercarlo Ghinzani@1983-1986", "Corrado Fabi@1983", "Jo Gartner@1984", "Huub Rothengatter@1985", "Christian Danner@1986", "Alex Caffi@1987", "Nicola Larini@1988-1989", "Olivier Grouillard@1990"]],
  ["Toleman", 1.2, ["Brian Henton@1981", "Derek Warwick@1981"]],
  ["Arrows", 1.6, ["Marc Surer@1982", "Mauro Baldi@1982"]],
  ["Tyrrell", 2.2, ["Martin Brundle@1984", "Stefan Bellof@1984"]],
  ["RAM", 1.2, ["Eliseo Salazar@1983", "Jean-Louis Schlesser@1983", "Kenny Acheson@1983", "Philippe Alliot@1984-1985", "Jonathan Palmer@1984", "Manfred Winkelhock@1985"]],
  ["Spirit", 1.2, ["Stefan Johansson@1983", "Mauro Baldi@1984-1985", "Huub Rothengatter@1984"]],
  ["Zakspeed", 1.3, ["Jonathan Palmer@1985-1986", "Huub Rothengatter@1986", "Martin Brundle@1987", "Christian Danner@1987", "Piercarlo Ghinzani@1988", "Bernd Schneider@1988-1989", "Aguri Suzuki@1989"]],
  ["Larrousse", 1.8, ["Philippe Alliot@1987-1990;1993", "Yannick Dalmas@1987-1988", "Michele Alboreto@1989", "Éric Bernard@1989-1990", "Aguri Suzuki@1990-1991", "Bertrand Gachot@1992", "Ukyo Katayama@1992", "Érik Comas@1993-1994", "Olivier Beretta@1994"]],
  ["Scuderia Italia (Dallara)", 1.8, ["Alex Caffi@1988-1989", "Andrea de Cesaris@1989-1990", "Emanuele Pirro@1990-1991", "JJ Lehto@1991-1992", "Pierluigi Martini@1992", "Michele Alboreto@1993", "Luca Badoer@1993"]],
  ["Leyton House", 2.0, ["Ivan Capelli@1991", "Maurício Gugelmin@1991"]],
  ["Onyx", 1.6, ["Stefan Johansson@1989-1990", "Bertrand Gachot@1989", "JJ Lehto@1990"]],
  ["AGS", 1.2, ["Ivan Capelli@1986", "Pascal Fabre@1987", "Roberto Moreno@1987", "Philippe Streiff@1988", "Gabriele Tarquini@1989-1991", "Yannick Dalmas@1990", "Fabrizio Barbazza@1991"]],
  ["Rial", 1.3, ["Andrea de Cesaris@1988", "Christian Danner@1989", "Volker Weidler@1989"]],
  ["Coloni", 1.0, ["Nicola Larini@1987", "Gabriele Tarquini@1988", "Roberto Moreno@1989", "Pierre-Henri Raphanel@1989", "Bertrand Gachot@1990", "Pedro Chaves@1991"]],
  ["EuroBrun", 1.0, ["Oscar Larrauri@1988", "Stefano Modena@1988", "Gregor Foitek@1989", "Roberto Moreno@1990", "Claudio Langes@1990"]],
  ["Brabham", 1.2, ["Eric van de Poele@1992", "Damon Hill@1992", "Giovanna Amati@1992"]],
  ["Fondmetal", 1.2, ["Olivier Grouillard@1991", "Gabriele Tarquini@1992", "Andrea Chiesa@1992"]],
  ["Simtek", 1.0, ["David Brabham@1994", "Roland Ratzenberger@1994", "Jos Verstappen@1995", "Domenico Schiattarella@1995"]],
  ["Pacific", 1.0, ["Bertrand Gachot@1994-1995", "Paul Belmondo@1994", "Andrea Montermini@1995"]],
  ["Forti", 1.0, ["Pedro Diniz@1995", "Roberto Moreno@1995", "Luca Badoer@1996", "Andrea Montermini@1996"]]
];
(function () {
  const on = (spec, y) => spec.split(";").some(r => { const [a, b] = r.split("-").map(Number); return y >= a && y <= (b || a); });
  Object.keys(V18_GRID_TARGET).forEach(k => {
    const y = +k, H = V15_HIST[y]; if (!H) return;
    const target = V18_GRID_TARGET[y];
    const used = new Set(H.D.map(d => d[0]));
    let cars = H.D.length;
    V18_PRIVATE.forEach(([team, car, list]) => {
      if (cars >= target || H.T.some(t => t[0] === team)) return;
      const ds = list.map(x => x.split("@")).filter(([n, r]) => on(r, y) && !used.has(n)).map(([n]) => n).slice(0, Math.min(2, target - cars));
      if (!ds.length) return;
      H.T.push([team, car]);
      ds.forEach(n => { H.D.push([n, 0, 0, team]); used.add(n); if (!(n in V15_RATING)) V15_RATING[n] = 72; });
      cars += ds.length;
    });
  });
  try {
    Object.assign(teamColors, {
      "Rob Walker Racing": "#0b2d6b", "Scuderia Centro Sud": "#c62828", "British Racing Partnership": "#2e7d32", "Yeoman Credit Racing": "#1b5e20", "UDT Laystall": "#7cb342",
      "Reg Parnell Racing": "#455a64", "Frank Williams Racing Cars": "#1565c0", "Ensign": "#c62828", "Embassy Hill": "#f5f5f5", "Penske": "#e53935", "Parnelli": "#e53935",
      "Fittipaldi (Copersucar)": "#f9a825", "ATS": "#ffd600", "ATS (Italia)": "#b71c1c", "Theodore Racing": "#c62828", "Osella": "#1e88e5", "RAM": "#e53935", "Spirit": "#fafafa",
      "Zakspeed": "#e53935", "Larrousse": "#1565c0", "Scuderia Italia (Dallara)": "#d32f2f", "Leyton House": "#4dd0e1", "Onyx": "#00838f", "AGS": "#1e88e5", "Rial": "#1565c0",
      "Coloni": "#fbc02d", "EuroBrun": "#e53935", "Fondmetal": "#212121", "Simtek": "#5e35b1", "Pacific": "#1e88e5", "Forti": "#fdd835", "Scarab": "#1565c0", "Tecno": "#d84315",
      "Maserati privados": "#a6002c", "Ecurie Rosier": "#1f5fbf", "Enrico Platé": "#a6002c", "ERA": "#2e7d32", "Scuderia Ambrosiana": "#a6002c", "Ecurie Belge": "#fdd835",
      "OSCA": "#c62828", "Escuderia Bandeirantes": "#2e7d32", "Ecurie Espadon": "#c62828", "Ecurie Ecosse": "#0d47a1", "Equipe Moss": "#2e7d32", "Alta": "#2e7d32",
      "Ecurie Maarsbergen": "#ff8f00", "Ecurie Francorchamps": "#fdd835", "Gilby Engineering": "#2e7d32", "Equipe Nationale Belge": "#fdd835", "Siffert Racing Team": "#c62828", "DW Racing Enterprises": "#2e7d32", "John Willment Automobiles": "#2e7d32", "Joakim Bonnier Racing Team": "#1565c0",
      "Guy Ligier Racing": "#0033a0", "Antique Automobiles": "#2e7d32", "Silvio Moser Racing Team": "#c62828", "Scirocco-Powell": "#1565c0", "Merzario": "#c62828"
    });
  } catch (e) {}
})();
