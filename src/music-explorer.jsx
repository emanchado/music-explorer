const React = require('react'),
      ReactDOM = require('react-dom'),
      R = require("ramda"),
      teoria = require("teoria");

const NUMBER_OCTAVES = 2;

const noteNames = {
    "c#": "C# D♭",
    "d#": "D# E♭",
    "f#": "F# G♭",
    "g#": "G# A♭",
    "a#": "A# B♭"
};

const initialScale = 'major', initialKey = '';

function noteLabel(note) {
    if (noteNames.hasOwnProperty(note)) {
        return noteNames[note];
    } else {
        return note.toUpperCase();
    }
}


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
        playNote(this.props.octave, this.props.note);
    },

    render: function() {
        const keyTypeClassName = this.props.note.length > 1 ? 'ebony' : '',
              scaleHighlightClassName = this.props.highlightScale ? 'in-scale' : '',
              chordHighlightClassName = this.props.highlightChord ? 'in-chord' : '',
              className = keyTypeClassName + ' ' + scaleHighlightClassName + ' ' + chordHighlightClassName,
              label = noteLabel(this.props.note),
              audioUrl = this.noteAudioUrl(this.props.octave, this.props.note),
              note = teoria.note(this.props.note),
              audioElId = "audioEl-" + this.props.octave + "-" + note.chroma();

        return (
            <li className={className} onClick={this.handleClick}>
              <div className="note-name">{label}</div>
              <audio id={audioElId} preload="auto" src={audioUrl} />
            </li>
        );
    }
});

const octaveNotes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#",
                     "a", "a#", "b"];

const Piano = React.createClass({
    noteInNoteGroup: function (noteName, group) {
        const note = teoria.note(noteName);

        return group && group.notes().some(function(groupNote) {
            return groupNote.chroma() === note.chroma();
        });
    },

    render: function() {
        const scaleKeyName = this.props.scalekey,
              scaleName = this.props.scale,
              currentScale = (scaleKeyName && scaleName) ?
                  teoria.note(scaleKeyName + '4').scale(scaleName) :
                  null,
              keys = R.flatten(R.range(0, NUMBER_OCTAVES).map((octaveNumber) => {
                  return octaveNotes.map((note) => {
                      let reactKey = (octaveNumber + 1) + "-" + note,
                          inScale = this.noteInNoteGroup(note, currentScale),
                          inChord = this.noteInNoteGroup(note,
                                                         this.props.highlightChord);
                      return (
                          <PianoKey octave={octaveNumber+1}
                                    key={reactKey}
                                    note={note}
                                    highlightScale={inScale}
                                    highlightChord={inChord} />
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
                      teoria.note(this.props.keyName + '4').scale(this.props.scaleName) :
                      null;
        let matchingChordMarkup;

        if (scale) {
            const potentialChords = R.flatten(scale.notes().map((note) => {
                return ['', 'm', 'dim', 'aug'].map((chordType) => {
                    return note.chord(chordType);
                });
            }));

            const matchingChords = potentialChords.filter(function(chord) {
                return isChordInScale(chord, scale);
            });

            matchingChordMarkup = matchingChords.map((chord) => {
                return (
                    <li key={chord.name}>
                      <a href="#" onClick={this.chordSelectionHandler(chord)}>{chord.name}</a>
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
                  Matching chords for {scale.name}:
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
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="blues">Blues</option>
                <option value="phrygian">Phrygian</option>
              </select>

              <MatchingChords keyName={this.props.keyName}
                              scaleName={this.props.scaleName}
                              onSelectChord={this.props.onSelectChord} />
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
        return {scale: initialScale, key: initialKey};
    },

    onChangeScale: function(newScale) {
        this.setState({scale: newScale, highlightChord: null});
    },

    onChangeKey: function(newKey) {
        this.setState({key: newKey, highlightChord: null});
    },

    selectChordHandler: function(chord) {
        return () => {
            for (let note of chord.simple()) {
                playNote(1, note);
            }
            this.setState({highlightChord: chord});
        };
    },

    onSelectChord: function(chord) {
        for (let note of chord.simple()) {
            playNote(1, note);
        }
        this.setState({highlightChord: chord,
                       chordName: chord.name});
    },

    onChangeChordName: function(e) {
        const newChordName = e.target.value;
        this.setState({chordName: newChordName});
    },

    onClickHighlightChord: function(/*e*/) {
        try {
            const newChord = teoria.chord(this.state.chordName);
            this.onSelectChord(newChord);
        } catch (e) {
            console.log("Ignoring unknown chord '" + this.state.chordName + "'");
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

        return (
            <div>
              <Piano scale={this.state.scale} scalekey={this.state.key} highlightChord={this.state.highlightChord} />

              <ScaleSelector keyName={this.state.key}
                             scaleName={this.state.scale}
                             onChangeKey={this.onChangeKey}
                             onChangeScale={this.onChangeScale}
                             onSelectChord={this.onSelectChord} />

              Highlight chord:
              <div>
                <input type="text"
                       size="7"
                       className={chordBoxCss}
                       value={this.state.chordName}
                       onChange={this.onChangeChordName} />
                <button type="submit"
                        onClick={this.onClickHighlightChord}>Highlight</button>
              </div>
            </div>
        );
    }
});

ReactDOM.render(
    <MusicExplorerApp />,
    document.getElementById('contents')
);
