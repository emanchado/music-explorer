const React = require("react"),
      ReactDOM = require("react-dom"),
      R = require("ramda"),
      teoria = require("teoria"),
      RUList = require("../lib/RUList");

const NUMBER_OCTAVES = 2;

const noteNames = {
    "c#": "C♯ D♭",
    "d#": "D♯ E♭",
    "f#": "F♯ G♭",
    "g#": "G♯ A♭",
    "a#": "A♯ B♭"
};

const initialScale = "major", initialKey = "";

function playNote(octave, noteName) {
    let note = teoria.note(noteName),
        audioEl = document.getElementById("audioEl-" +
                                          octave +
                                          "-" +
                                          note.chroma());
    if (audioEl.paused) {
        audioEl.play();
    } else {
        audioEl.currentTime = 0;
    }
}

const PianoKey = React.createClass({
    noteAudioUrl: function (octaveNumber, noteName) {
        const note = teoria.note(noteName);
        return "notes/" + octaveNumber + "-" + note.chroma() + ".mp3";
    },

    handleClick: function() {
        playNote(this.props.octave, this.props.noteName);
    },

    noteInScale: function (note, scale) {
        if (scale) {
            const scaleNotes = scale.notes();
            for (let i = 0, len = scaleNotes.length; i < len; i++) {
                if (scaleNotes[i].chroma() === note.chroma()) {
                    const scaleNote = scaleNotes[i];
                    return scaleNote.name().toUpperCase() +
                           scaleNote.accidental();
                }
            }
        }

        return null;
    },

    noteRoleInChord: function (note, chord) {
        var role = null;

        if (chord) {
            chord.notes().forEach(function(chordNote) {
                if (chordNote.chroma() === note.chroma()) {
                    role = chord.root.interval(chordNote);
                }
            });
        }

        return role;
    },

    roleInChordDiv: function(roleInChord) {
        if (!roleInChord) {
            return (
                <div className="note-role">&nbsp;</div>
            );
        } else if (roleInChord.toString() === "P1") {
            // Want to show as "R" (for "root"), not as P1. Also, mark
            // with a CSS class because it's kind of special
            return (
                <div className="note-role note-role-root">R</div>
            );
        } else {
            return (
                <div className="note-role">{roleInChord.toString()}</div>
            );
        }
    },

    noteLabel: function(noteName) {
        if (noteNames.hasOwnProperty(noteName)) {
            return noteNames[noteName];
        } else {
            return noteName.toUpperCase();
        }
    },

    render: function() {
        const note = teoria.note(this.props.noteName),
              noteInScale = this.noteInScale(note, this.props.scale),
              roleInChord = this.noteRoleInChord(note, this.props.chord),
              label = noteInScale || this.noteLabel(this.props.noteName),
              audioUrl = this.noteAudioUrl(this.props.octave,
                                           this.props.noteName),
              audioElId = "audioEl-" + this.props.octave + "-" + note.chroma();

        const scaleInclusionClassName = noteInScale ? "in-scale" : "out-scale",
              scaleHighlightClassName = this.props.scale ?
                                        scaleInclusionClassName : "",
              chordHighlightClassName = roleInChord ? "in-chord" : "",
              className = (note.accidental().length ? "ebony" : "") + " " +
                          scaleHighlightClassName + " " +
                          chordHighlightClassName;

        return (
            <li className={className} onClick={this.handleClick}>
              <div className="note">
                {this.roleInChordDiv(roleInChord)}
                <div className="note-name">{label}</div>
              </div>
              <audio id={audioElId} preload="auto" src={audioUrl} />
            </li>
        );
    }
});

const octaveNotes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#",
                     "a", "a#", "b"];

const Piano = React.createClass({
    render: function() {
        const scaleKeyName = this.props.scalekey,
              scaleName = this.props.scale,
              currentScale = (scaleKeyName && scaleName) ?
                             teoria.note(scaleKeyName + "4").scale(scaleName) :
                             null,
              keys = R.flatten(R.range(0, NUMBER_OCTAVES).map((octaveNumber) => {
                  return octaveNotes.map((note) => {
                      let reactKey = (octaveNumber + 1) + "-" + note;
                      return (
                          <PianoKey octave={octaveNumber+1}
                                    key={reactKey}
                                    noteName={note}
                                    scale={currentScale}
                                    chord={this.props.highlightChord} />
                      );
                  });
              }));

        return (
            <ol className="piano">
              {keys}
            </ol>
        );
    }
});

const MatchingChords = React.createClass({
    chordSelectionHandler: function(chordName) {
        return (/*e*/) => {
            this.props.onSelectChord(chordName);
        };
    },

    render: function() {
        const scale = (this.props.keyName && this.props.scaleName) ?
                      teoria.note(this.props.keyName + "4").scale(this.props.scaleName) :
                      null;
        let matchingChordMarkup;

        if (scale) {
            const potentialChords = R.flatten(scale.notes().map((note) => {
                return ["", "m", "dim", "aug"].map((chordType) => {
                    return note.chord(chordType);
                });
            }));

            const matchingChords = potentialChords.filter(function(chord) {
                return isChordInScale(chord, scale);
            });

            matchingChordMarkup = matchingChords.map((chord) => {
                return (
                    <li key={chord.name}>
                      <Chord onClick={this.chordSelectionHandler(chord)} chord={chord} />
                    </li>
                );
            });
        } else {
            matchingChordMarkup = (
                <em>Select key/scale to show basic matching chords</em>
            );
        }

        if (scale) {
            return (
                <div>
                  <h2>Matching chords for {this.props.keyName.toUpperCase()} {scale.label}</h2>
                  <ul className="chords">{matchingChordMarkup}</ul>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    }
});

const Chord = React.createClass({
    render: function() {
        return (
            <a href="#" onClick={this.props.onClick}>{this.props.chord.name}</a>
        );
    }
});

const ScaleSelector = React.createClass({
    onChangeKey: function(e) {
        const newKey = e.target.options[e.target.selectedIndex].value;
        this.props.onChangeKey(newKey);
    },

    onChangeScale: function(e) {
        const newScale = e.target.options[e.target.selectedIndex].value;
        this.props.onChangeScale(newScale);
    },

    render: function() {
        const scaleOptions = teoria.Scale.KNOWN_SCALES.map((scale) => {
            return (
                <option key={scale.name} value={scale.name}>{scale.label}</option>
            );
        });

        return (
            <div>
              <select value={this.props.keyName} onChange={this.onChangeKey}>
                <option value="">Choose a key</option>
                <option value="c">C</option>
                <option value="c#">C# / D♭</option>
                <option value="d">D</option>
                <option value="d#">D# / E♭</option>
                <option value="e">E</option>
                <option value="f">F</option>
                <option value="f#">F# / G♭</option>
                <option value="g">G</option>
                <option value="g#">G# / A♭</option>
                <option value="a">A</option>
                <option value="a#">A# / B♭</option>
                <option value="b">B</option>
              </select>

              <select value={this.props.scaleName} onChange={this.onChangeScale}>
                {scaleOptions}
              </select>
            </div>
        );
    }
});

function isChordInScale(chord, scale) {
    const scaleNoteChromas = scale.notes().map((n) => {
        return n.chroma();
    });

    return chord.notes().every((chordNote) => {
        return scaleNoteChromas.indexOf(chordNote.chroma()) !== -1;
    });
}

const MusicExplorerApp = React.createClass({
    getInitialState: function() {
        return {scale: initialScale,
                key: initialKey,
                lastUsedChords: new RUList()};
    },

    onChangeScale: function(newScale) {
        this.setState({scale: newScale});
    },

    onChangeKey: function(newKey) {
        this.setState({key: newKey});
    },

    onSelectChord: function(chord) {
        if (chord) {
            for (let note of chord.simple()) {
                playNote(1, note);
            }
            this.setState({highlightChord: chord,
                           chordName: chord.name});
        } else {
            this.setState({highlightChord: null,
                           chordName: ""});
        }
    },

    onChangeChordName: function(e) {
        const newChordName = e.target.value;
        this.setState({chordName: newChordName});
    },

    onClickHighlightChord: function(/*e*/) {
        try {
            const newChord = teoria.chord(this.state.chordName);
            this.onSelectChord(newChord);

            this.state.lastUsedChords.add(newChord.name);
        } catch (e) {
            if (this.state.chordName) {
                console.log("Ignoring unknown chord '" + this.state.chordName + "'");
            } else {
                this.onSelectChord(null);
            }
        }
    },

    render: function() {
        let chord,
            chordBoxCss = "chord-name";
        try {
            chord = teoria.chord(this.state.chordName);
        } catch (e) {
            // Only mark as wrong if the chordName isn't empty, as
            // it's irritating that the cursor turns red on an empty
            // textbox
            if (this.state.chordName && this.state.chordName.length) {
                chordBoxCss += " wrong";
            }
        }

        let lastChords = this.state.lastUsedChords.toArray(),
            lastChordsMarkup;

        if (lastChords.length) {
            let lastChordsItems = lastChords.map(chordName => {
                const chord = teoria.chord(chordName),
                      clickHandler = (/*ev*/) => {
                          this.onSelectChord(chord);
                      };

                return (
                    <li><Chord key={chordName} onClick={clickHandler} chord={chord} /></li>
                );
            });

            lastChordsMarkup = (
                <ul className="chords">{lastChordsItems}</ul>
            );
        } else {
            lastChordsMarkup = (
                <em>None</em>
            );
        }

        return (
            <div>
              <Piano scale={this.state.scale}
                     scalekey={this.state.key}
                     highlightChord={this.state.highlightChord} />

              <div className="toolbox">
                <div className="scale-tools">
                  <h1>Scales</h1>
                  <ScaleSelector keyName={this.state.key}
                                 scaleName={this.state.scale}
                                 onChangeKey={this.onChangeKey}
                                 onChangeScale={this.onChangeScale} />
                </div>

                <div className="chord-tools">
                  <h1>Chords</h1>
                  <MatchingChords keyName={this.state.key}
                                  scaleName={this.state.scale}
                                  onSelectChord={this.onSelectChord} />

                  <h2>Highlight chord</h2>
                  <input type="text"
                         size="7"
                         className={chordBoxCss}
                         value={this.state.chordName}
                         onChange={this.onChangeChordName} />
                  <button type="submit"
                          onClick={this.onClickHighlightChord}>Highlight</button>

                  <h2>Last used chords</h2>
                  <ul className="chords">{lastChordsMarkup}</ul>
                </div>
              </div>
            </div>
        );
    }
});

ReactDOM.render(
    <MusicExplorerApp />,
    document.getElementById("app")
);
