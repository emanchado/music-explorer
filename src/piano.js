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

/*jshint ignore:start */
const PianoKey = React.createClass({
    render: function() {
        const keyTypeClassName = this.props.note.length > 1 ? 'ebony' : '',
              highlightClassName = this.props.highlightScale ? 'in-scale' : '',
              className = keyTypeClassName + ' ' + highlightClassName,
              octaveNumber = this.props.octave,
              label = noteLabel(this.props.note),
              audioUrl = noteAudioUrl(octaveNumber, this.props.note);

        return (
            <li className={className} onClick={this.handleClick}>
                {label}
                <audio ref="audioEl" preload="auto" src={audioUrl} />
            </li>
        );
    },

    handleClick: function() {
        const audioEl = this.refs.audioEl;

        if (audioEl.paused) {
            audioEl.play();
        } else {
            audioEl.fastSeek(0);
        }
    }
});

function noteInScale(noteName, scale) {
    const note = teoria.note(noteName);

    return scale.notes().some(function(scaleNote) {
        return scaleNote.chroma() === note.chroma();
    });
}

const Piano = React.createClass({
    render: function() {
        const octaveKeys = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#",
                            "a", "a#", "b"];
        const currentScale = teoria.note(this.props.scalekey + '4').scale(this.props.scale);
        const keys = R.flatten(R.range(0, NUMBER_OCTAVES).map(function(octaveNumber) {
            return octaveKeys.map(function(note) {
                let reactKey = (octaveNumber + 1) + "-" + note,
                    inScale = noteInScale(note, currentScale);
                return (
                        <PianoKey octave={octaveNumber+1}
                    key={reactKey} note={note} highlightScale={inScale} />
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

const MusicExplorerApp = React.createClass({
    getInitialState: function() {
        return {scale: initialScale, key: initialKey};
    },

    render: function() {
        return (
                <div>
                <Piano scale={this.state.scale} scalekey={this.state.key} />

                <div class="tools">
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
                </div>
                </div>
        );
    },

    onChangeScale: function(e) {
        const newScale = e.target.options[e.target.selectedIndex].value;
        this.setState({scale: newScale});
    },

    onChangeKey: function(e) {
        const newKey = e.target.options[e.target.selectedIndex].value;
        this.setState({key: newKey});
    }
});

ReactDOM.render(
    /*jshint ignore:start */
        <MusicExplorerApp />,
    /*jshint ignore:end */
    document.getElementById('contents')
);
