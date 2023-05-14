import {useRef, useState} from 'react';
import spinner from './spinner.svg';

function App() {
    let [state, setState] = useState('upload');
    let [scan, setScan] = useState();

    let handleFile = async (file) => {
        setState('processing');

        let body = new FormData();
        body.set('file', file);

        let response = await fetch(`/scan`, {
            method: 'POST',
            body
        });

        if (!response.ok) {
            alert('An error occurred while scanning the file. Try again later.');
            setState('upload');
            return;
        }

        let results = await response.json();
        results.fileName = file.name;

        setScan(results);
        setState('results');
    }

    return <div className="app">
        <header>
            <h1 className="centered">HangarTotal</h1>
            <p className="centered">Easily scan your jars with Hangar's jarscanner</p>

            {state === 'upload' ? <UploadWidget handleFile={handleFile}/> : null}
            {state === 'processing' ? <Spinner/> : null}
            {state === 'results' ? <Scan scan={scan} setState={setState}/> : null}
        </header>
    </div>;
}

function UploadWidget({handleFile}) {
    let fileRef = useRef();
    let [over, setOver] = useState(false);

    let dropHandler = (event) => {
        setOver(false);
        event.preventDefault();

        let file = event.dataTransfer.files[0];
        if (!file) return;

        handleFile(file);
    }

    let fileHandler = (event) => {
        let file = event.target.files[0];
        event.preventDefault();
        if (!file) return;

        handleFile(file);
    }

    let dragOver = (event) => {
        setOver(true);
        event.stopPropagation();
        event.preventDefault();
    }

    return <div>
        <div className={`dropzone ${over ? 'over' : ''}`}
             onDragEnter={() => setOver(true)} onDragOver={dragOver}
             onDragLeave={() => setOver(false)} onDrop={dropHandler}>
            <h2 className="centered">drop your file here</h2>
            <button onClick={() => fileRef.current?.click()}>or select a file instead
            </button>
            <input type="file" id="file" name="file" ref={fileRef} style={{display: 'none'}}
                   onChange={fileHandler}/>
        </div>
        <p className="centered disclaimer">your files will be uploaded only for analysis and are removed immediately
            after</p>
    </div>;
}

function Spinner() {
    return <img src={spinner} className="spinner" alt="Spinner"/>;
}

const SEVERITIES = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST', 'UNKNOWN'];

function Scan({scan, setState}) {
    let highestSeverityIndex = SEVERITIES.indexOf(scan.highestSeverity);

    return <div>
        <hr/>
        <button onClick={() => setState('upload')}>new scan</button>
        <p className="centered">Please keep in mind that these results can contain false-positives and false-negatives.
            Always do your own research!</p>
        <h3 className="centered">{scan.fileName}</h3>
        <div className="pills">
            {[...Array(5 - highestSeverityIndex)].map(() => <span className={`pill pill-${highestSeverityIndex}`}/>)}
            {[...Array(highestSeverityIndex)].map(() => <span className='pill pill-5'/>)}
        </div>
        <h3 className={`centered severity-${highestSeverityIndex}`}>Severity: {scan.highestSeverity.toLowerCase()}</h3>

        <ul>
            {scan.results.map((result) => <li>
                <h5 className={`severity-${SEVERITIES.indexOf(result.severity)} no-margin`}>{result.message}</h5>

                Severity: {result.severity}
                <br/>
                {result.location}
            </li>)}
        </ul>
    </div>;
}

export default App;
