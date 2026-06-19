\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{hspf_thesis}[2025/09/01 Structured class for theses/reports]

% ==================================================================
% Base class
% ==================================================================
\LoadClass[12pt,a4paper]{article}

\RequirePackage{silence}
\WarningFilter{latex}{Command \@parboxrestore}

% ==================================================================
% Language & hyphenation
% ==================================================================
\usepackage[german]{babel}
\RequirePackage[ngerman=ngerman-x-latest]{hyphsubst}

% ==================================================================
% Encoding, fonts & typography
% (inputenc is unnecessary on modern LaTeX; keep T1 for hyphenation)
% ==================================================================
\RequirePackage[T1]{fontenc}
\RequirePackage{microtype}

% Serif/Sans/Mono
% Prefer modern Times-like setup: newtxtext/newtxmath over mathptmx
\RequirePackage{newtxtext}
\RequirePackage{newtxmath}
\RequirePackage[scaled=0.9]{helvet}
\RequirePackage{courier}  % \texttt

% Line spacing
\RequirePackage{setspace}
\setstretch{1.3}


% ==================================================================
% Page geometry & headers/footers
% ==================================================================
\RequirePackage[left=3.5cm,right=2.5cm,top=2.5cm,bottom=2cm,footskip=1cm,headheight=15pt]{geometry}

\RequirePackage{etoolbox}
\preto\section{}
% Manual page break helper before/after major sections (use explicitly)
\newcommand{\sectionbreak}{\clearpage}

% Fancy headers/footers
\RequirePackage{fancyhdr}
\newcommand{\setFancyHead}{% restore the normal fancy head
  \pagestyle{fancy}
  \fancyhf{}
  \fancyhead[L]{\nouppercase{\leftmark}}
  \fancyhead[R]{\thepage}
}
\setFancyHead

\RequirePackage{tocloft}
\RequirePackage[parfill]{parskip} % paragraphs separated by space, no indent

\RequirePackage{graphicx}      % includegraphics
\RequirePackage[export]{adjustbox}
\RequirePackage[section]{placeins} % prevent floats crossing section boundary
\RequirePackage{float}
\RequirePackage[justification=raggedright,singlelinecheck=false]{caption}
\RequirePackage{subcaption}    % sub-figures/captions


\RequirePackage{longtable}
\RequirePackage{tabulary}
\RequirePackage{tabularx}
\RequirePackage{diagbox}
\RequirePackage{multirow}
\RequirePackage{multicol}

\RequirePackage{siunitx}
\sisetup{per-mode=symbol}
\RequirePackage{eurosym}

\usepackage[inline]{enumitem}

\renewcommand{\cftsecdotsep}{\cftdotsep}
\renewcommand{\cftsubsecdotsep}{\cftdotsep}
\renewcommand{\cftsubsubsecdotsep}{\cftdotsep}
% ==================================================================
% Hyperref muss VOR glossaries geladen werden!
% ==================================================================
\RequirePackage[hidelinks]{hyperref}
\hypersetup{bookmarksnumbered}

% ==================================================================
% Glossaries / Acronyms  (choose glossaries; drop nomencl to avoid redundancy)
% ==================================================================
\RequirePackage[automake,nonumberlist,acronym,toc]{glossaries}
\makeglossaries
\renewcommand{\glsgroupskip}{} % reduce vertical skips between groups
\newcommand{\glsfull}[1]{\glsentrylong{#1} (\glsentryshort{#1})}
% ==================================================================
% Code listings (minted) with list of listings support
% NOTE: Requires -shell-escape to compile (Pygments).
% ==================================================================
\RequirePackage[newfloat]{minted}

% Default minted styles (tweak as needed)
\setminted[java]{frame=single,framesep=2mm,baselinestretch=1,fontsize=\footnotesize,linenos,numbersep=5pt}
\setminted[c]{frame=single,framesep=2mm,baselinestretch=1,fontsize=\footnotesize,linenos,numbersep=5pt}
\setminted[cpp]{frame=single,framesep=2mm,baselinestretch=1,fontsize=\footnotesize,linenos,numbersep=5pt}
\setminted[json]{frame=single,framesep=2mm,baselinestretch=1,fontsize=\footnotesize,linenos,numbersep=5pt}
\setminted[bash]{frame=single,framesep=2mm,baselinestretch=1,fontsize=\footnotesize,linenos,numbersep=5pt}
\setminted[text]{frame=single,framesep=2mm,baselinestretch=1,fontsize=\footnotesize,linenos,numbersep=5pt}





\RequirePackage{comment}
\RequirePackage{lipsum}

% ==================================================================
% Numbering schemes and "matter" environments
% ==================================================================
\newcommand{\romannumbering}{%
  \pagenumbering{roman}%
  \setcounter{page}{1}%
  \addtocounter{page}{1}%
}
\newcommand{\arabicnumbering}{%
  \pagenumbering{arabic}%
  \setcounter{page}{1}%
}

\newenvironment{titlematter}{\romannumbering}{}
\newenvironment{frontmatter}{\romannumbering}{\clearpage}
\newenvironment{mainmatter}{\arabicnumbering}{\clearpage\phantomsection}

% ==================================================================
% ToC and standard lists (no geometry reset)
% ==================================================================
\newcommand{\inhaltsverzeichnis}{%
  \fancyhf{}%
  \fancyhead[R]{\thepage}%
  \tableofcontents%
  \sectionbreak%
  \phantomsection%
  \setFancyHead%
}

\newcommand{\abbildungsverzeichnis}{%
  \addcontentsline{toc}{section}{Abbildungsverzeichnis}%
  \addtocontents{lof}{\vskip 0.4cm}%
  \listoffigures%
  \sectionbreak%
  \phantomsection%
}

\newcommand{\listingsverzeichnis}{%
  \addcontentsline{toc}{section}{Listingsverzeichnis}%
  \addtocontents{lol}{\vskip 0.4cm}%
  \listoflistings%
  \sectionbreak%
  \phantomsection%
}

\newcommand{\tabellenverzeichnis}{%
  \addcontentsline{toc}{section}{Tabellenverzeichnis}%
  \addtocontents{lot}{\vskip 0.4cm}%
  \listoftables%
  \sectionbreak%
  \phantomsection%
}

\newcommand{\acronyme}{%
  \printglossary[type=\acronymtype]% 
  \clearpage%
  \phantomsection%
}

\newcommand{\glossar}{%
  \printglossary%
  \clearpage%
  \phantomsection%
}

\newcommand{\literaturverzeichnis}{%
  \printbibliography[heading=bibintoc, title={Literaturverzeichnis}]%
  \clearpage%
  \phantomsection%
}

% ==================================================================
% Appendix machinery (clean TOC version)
% ==================================================================

\newcommand{\anhangsverzeichnisName}{Anhang}
\newlistof{anhangselement}{ahv}{\anhangsverzeichnisName}

\newcommand{\anhangselement}[1]{%
  \refstepcounter{anhangselement}%
  \addcontentsline{ahv}{anhangselement}{\protect\numberline{\theanhangselement}#1}\par
}
\newcommand{\addAnhangselement}[1]{%
  \phantomsection%
  \anhangselement{#1}%
}

\newcommand{\anhang}{%
  \addtocontents{ahv}{\vskip 0.3cm}%
  \listofanhangselement
  \clearpage%
  \phantomsection%
  %\input{99_Anhang/cloudhealth_goals_model}%
  \clearpage%
  \phantomsection%
}

% NEU: Fügt das Anhangsverzeichnis als Punkt ins Haupt-Inhaltsverzeichnis ein
\newcommand{\anhangsverzeichnis}{%
  \clearpage%
  \phantomsection%
  \addcontentsline{toc}{section}{\anhangsverzeichnisName}% Hier passiert die Magie fürs Haupt-ToC
  \listofanhangselement% Druckt das separate Verzeichnis
  \clearpage%
}

\newcounter{anhangZaehler}
\renewcommand{\theanhangZaehler}{\Alph{anhangZaehler}}

\newcommand{\neuerAnhang}[1]{%
  \clearpage
  \phantomsection
  \refstepcounter{anhangZaehler}%
  \section*{Anhang \theanhangZaehler: #1} % Beschriftung im Dokument (z.B. "Anhang A: Best Practices")
  \addcontentsline{toc}{section}{Anhang \theanhangZaehler: #1} % Eintrag ins Haupt-Inhaltsverzeichnis
}

% ==================================================================
% Other helpers
% ==================================================================

%\newcommand{\eidErklaerung}{%
%  \input{dokumente/99_eidesstaatliche_erklaerung.tex}%
%}