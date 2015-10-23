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

const initialScale = 'major', initialKey = 'c';

function noteLabel(note) {
    if (noteNames.hasOwnProperty(note)) {
        return noteNames[note];
    } else {
        return note.toUpperCase();
    }
}

function noteAudioUrl(octaveNumber, note) {
    return "notes/" + octaveNumber + "-" + note.replace("#", "s") + ".mp3";
}

function playNote(octave, note) {
    let audioEl = document.getElementById("audioEl-" +
                                          octave +
                                          "-" + note.replace("#", "s"));
    if (audioEl.paused) {
        audioEl.play();
    } else {
        audioEl.currentTime = 0;
    }
}

function noteInNoteGroup(noteName, group) {
    const note = teoria.note(noteName);

    return group && group.notes().some(function(groupNote) {
        return groupNote.chroma() === note.chroma();
    });
}

/*jshint ignore:start */
const PianoKey = React.createClass({
    handleClick: function() {
        playNote(this.props.octave, this.props.note);
    },

    render: function() {
        const keyTypeClassName = this.props.note.length > 1 ? 'ebony' : '',
              scaleHighlightClassName = this.props.highlightScale ? 'in-scale' : '',
              chordHighlightClassName = this.props.highlightChord ? 'in-chord' : '',
              className = keyTypeClassName + ' ' + scaleHighlightClassName + ' ' + chordHighlightClassName,
              octaveNumber = this.props.octave,
              label = noteLabel(this.props.note),
              audioUrl = noteAudioUrl(octaveNumber, this.props.note),
              audioElId = "audioEl-" + this.props.octave + "-" + this.props.note.replace("#", "s");

        return (
                <li className={className} onClick={this.handleClick}>
                <div className="note-name">{label}</div>
                <audio id={audioElId} preload="auto" src={audioUrl} />
                </li>
        );
    }
});

const Piano = React.createClass({
    render: function() {
        const octaveNotes = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#",
                             "a", "a#", "b"],
              currentScale = teoria.note(this.props.scalekey +
                                         '4').scale(this.props.scale),
              highlightChord = this.props.highlightChord,
              keys = R.flatten(R.range(0, NUMBER_OCTAVES).map(function(octaveNumber) {
                  return octaveNotes.map(function(note) {
                      let reactKey = (octaveNumber + 1) + "-" + note,
                          inScale = noteInNoteGroup(note, currentScale),
                          inChord = noteInNoteGroup(note, highlightChord);
                      return (
                              <PianoKey octave={octaveNumber+1} key={reactKey} note={note} highlightScale={inScale} highlightChord={inChord} />
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
/*jshint ignore:end */

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

    onChangeScale: function(e) {
        const newScale = e.target.options[e.target.selectedIndex].value;
        this.setState({scale: newScale});
    },

    onChangeKey: function(e) {
        const newKey = e.target.options[e.target.selectedIndex].value;
        this.setState({key: newKey});
    },

    selectChordHandler: function(chord) {
        return () => {
            this.playNotes(chord.notes());
            this.setState({highlightChord: chord});
        };
    },

    playNotes: function(notes) {
        for (let note of notes) {
            playNote(1, note.name());
        }
    },

    render: function() {
        const scale = teoria.note(this.state.key + '4').scale(this.state.scale),
              potentialChords = R.flatten(scale.notes().map((note) => {
                  return ['', 'm', 'dim', 'aug'].map((chordType) => {
                      return note.chord(chordType);
                   });
              })),
              matchingChords = potentialChords.filter(function(chord) {
                  return isChordInScale(chord, scale);
              }),
              matchingChordMarkup = matchingChords.map((chord) => {
                  const onClickHandler = this.selectChordHandler(chord);
                  return (
                          <li key={chord.name}><a href="#" onClick={onClickHandler}>{chord.name}</a></li>
                  );
              });

        return (
                <div>
                <Piano scale={this.state.scale} scalekey={this.state.key} highlightChord={this.state.highlightChord} />

                <div className="tools">
                <select value={this.state.key} onChange={this.onChangeKey}>
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

                <select value={this.state.scale} onChange={this.onChangeScale}>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="blues">Blues</option>
                <option value="phrygian">Phrygian</option>
                </select>

                <div>
                Matching chords:
                <ul className="chords">{matchingChordMarkup}</ul>
                </div>
                </div>
                </div>
        );
    }
});

ReactDOM.render(
    /*jshint ignore:start */
        <MusicExplorerApp />,
    /*jshint ignore:end */
    document.getElementById('contents')
);
