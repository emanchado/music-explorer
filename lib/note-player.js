var R = require("ramda"),
    teoria = require("teoria");

const OCTAVE_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#",
                      "A", "A#", "B"],
      NUMBER_OCTAVES = 2;

function noteAudioUrl(octaveNumber, noteName) {
    const note = teoria.note(noteName);
    return "notes/" + octaveNumber + "-" + note.chroma() + ".mp3";
}

function audioElId(octaveNumber, chroma) {
    return "audioEl-" + octaveNumber + "-" + chroma;
}

function init() {
    R.range(0, NUMBER_OCTAVES).forEach((octaveNumber) => {
        R.range(0, OCTAVE_NOTES.length).forEach((chroma) => {
            const audioEl = document.createElement("audio");

            audioEl.id = audioElId(octaveNumber + 1, chroma);
            audioEl.src = noteAudioUrl(octaveNumber + 1, OCTAVE_NOTES[chroma]);
            audioEl.preload = "auto";

            document.body.appendChild(audioEl);
        });
    });
}

function playNote(octave, noteName) {
    let note = teoria.note(noteName),
        audioEl = document.getElementById(audioElId(octave, note.chroma()));

    if (audioEl.paused) {
        audioEl.play();
    } else {
        audioEl.currentTime = 0;
    }
}

module.exports.init = init;
module.exports.playNote = playNote;
module.exports.OCTAVE_NOTES = OCTAVE_NOTES;
module.exports.NUMBER_OCTAVES = NUMBER_OCTAVES;
