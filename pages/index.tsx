import { useEffect, useRef, useState } from 'react';
import { NativeSelect, Group, Stack, Text, Image, Progress, Button, Code, Skeleton,} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { createWorker } from 'tesseract.js';

const Home = () => {
    const [lang, setValue] = useState('eng');
    const [loading, setLoading] = useState(false);
    const [imageData, setImageData] = useState<null | string>(null);
    const clipboard = useClipboard({ timeout: 2500 });
    const loadFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageData = reader.result;
            setImageData(imageData as string);
        };
    reader.readAsDataURL(file);
    };

    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('waiting...');
    const [ocrResult, setOcrResult] = useState('');
    const workerRef = useRef<Tesseract.Worker | null>(null);
    
    useEffect(() => {
        workerRef.current = createWorker({
            logger: message => {
                if ('progress' in message) {
                setProgress(message.progress);
                setProgressLabel(message.progress == 1 ? '' : message.status);
                }
            }
        });
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        }
    }, []);

    const handleConvert = async () => {
        setLoading((l) => !l);
        setProgress(0);
        setProgressLabel('starting');

        const worker = workerRef.current!;
        await worker.load();
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        
        const response = await worker.recognize(imageData!);
        setOcrResult(response.data.text);
        console.log(response.data);
        setLoading((l) => !l)
    };
 
return (<>
    <Group align='initial' style={{ padding: '30px' }}>
        <Stack style={{ flex: '1' }}>
            <Dropzone
                onDrop={(files) => loadFile(files[0])}
                accept={IMAGE_MIME_TYPE}
                multiple={false} >{() => (
                    <Text style={{textAlign: 'center'}} size="xl" inline> Select file </Text>
                )}</Dropzone>

            <NativeSelect 
                value={lang} 
                onChange={(event) => setValue(event.currentTarget.value)} 
                data={['eng', 'mon']}  
                label="Language" />

            <Button disabled={!imageData || !workerRef.current} onClick={handleConvert}> Convert </Button>

            <Progress value={progress * 100}/>

            <Code style={{ textAlign: 'center', fontFamily: 'inherit'}}>{progressLabel.toLowerCase()}</Code>
            
            <Text size='xl'>RESULT: </Text>

            <Skeleton visible={loading}>
                <Code style={{minHeight: '100px', fontSize: '16px'}} block>{ocrResult}</Code>
            </Skeleton>

            <Button color={clipboard.copied ? 'teal' : 'blue'} onClick={() => clipboard.copy(ocrResult)}>
                {clipboard.copied ? 'Copied' : 'Copy'}
            </Button>
        </Stack>
        
        <Stack style={{ flex: '1' }}>
            <Text size='xl'>IMAGE PREVIEW: </Text>
            {!!imageData && <Image src={imageData}/>}
            {!imageData && <Image height={'340px'} alt="empty" withPlaceholder />}
        </Stack>
    </Group>
    </>);
}

export default Home;
