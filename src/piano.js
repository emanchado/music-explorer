var React = require('react'),
    ReactDOM = require('react-dom'),
    R = require("ramda");

const NUMBER_OCTAVES = 2;

var noteNames = {
    "c#": "C# D♭",
    "d#": "D# E♭",
    "f#": "F# G♭",
    "g#": "G# A♭",
    "a#": "A# B♭"
};

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
var PianoKey = React.createClass({
    render: function() {
        var className = this.props.note.length > 1 ? 'ebony' : '',
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

var Piano = React.createClass({
    render: function() {
        var octaveKeys = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#",
                          "a", "a#", "b"];
        var keys = R.flatten(R.range(0, NUMBER_OCTAVES).map(function(octaveNumber) {
            return octaveKeys.map(function(note) {
                let reactKey = (octaveNumber + 1) + "-" + note;
                return (
                        <PianoKey octave={octaveNumber+1} key={reactKey} note={note} />
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

ReactDOM.render(
    /*jshint ignore:start */
        <Piano />,
    /*jshint ignore:end */
    document.getElementById('contents')
);
