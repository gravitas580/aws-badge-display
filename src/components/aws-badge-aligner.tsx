import React, { useState, useRef, ChangeEvent } from 'react';
import { 
    Button,
    Select,
    MenuItem, 
    TextField, 
    Card, 
    CardContent, 
    CardHeader, 
    Typography,
    SelectChangeEvent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// 資格情報の定義
const AWS_CERTIFICATIONS = [
    { code: 'CLF', name: 'Cloud Practitioner', expectedFileName: 'aws-certified-cloud-practitioner.png' },
    { code: 'SAA', name: 'Solutions Architect Associate', expectedFileName: 'aws-certified-solutions-architect-associate.png' },
    { code: 'SAP', name: 'Solutions Architect Professional', expectedFileName: 'aws-certified-solutions-architect-professional.png' },
    { code: 'DVA', name: 'Developer Associate', expectedFileName: 'aws-certified-developer-associate.png' },
    { code: 'SOA', name: 'SysOps Administrator Associate', expectedFileName: 'aws-certified-sysops-administrator-associate.png' },
    { code: 'DAS', name: 'Data Analytics Specialty', expectedFileName: 'aws-certified-data-analytics-specialty.png' },
    { code: 'MLS', name: 'Machine Learning Specialty', expectedFileName: 'aws-certified-machine-learning-specialty.png' },
    { code: 'ANS', name: 'Advanced Networking Specialty', expectedFileName: 'aws-certified-advanced-networking-specialty.png' },
    { code: 'SCS', name: 'Security Specialty', expectedFileName: 'aws-certified-security-specialty.png' },
    { code: 'DOP', name: 'DevOps Engineer Professional', expectedFileName: 'aws-certified-devops-engineer-professional.png' },
    { code: 'DBS', name: 'DataBase Specialty', expectedFileName: 'aws-certified-database-specialty.png' },
    { code: 'DOP', name: 'SAP on AWS Professional', expectedFileName: 'aws-certified-sap-on-aws-speciality.png' },
    { code: 'DEA', name: 'Data Engineer Associate', expectedFileName: 'aws-certified-data-engineer-associate.png' },
    { code: 'MLA', name: 'Machine Learning Associate', expectedFileName: 'aws-certified-machine-learning-engineer-associate.png' },
    { code: 'AIF', name: 'AI Practitioner', expectedFileName: 'aws-certified-ai-practitioner.png' },
];

// バッジ情報のインターフェース
interface BadgeInfo {
    file: File;
    isOfficialBadge: boolean;
}

// Point2D型の定義
interface Point2D {
    readonly h: number;
    readonly w: number;
}

const AWSSertificationBadgeAligner: React.FC = () => {
    const [uploadedImages, setUploadedImages] = useState<{ [key: string]: BadgeInfo }>({});
    const [selectedBadges, setSelectedBadges] = useState<string[]>(Array(24).fill(''));
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [_position,setPositions] = useState<Point2D[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newUploadedImages: { [key: string]: BadgeInfo } = {};
        
        Array.from(files).forEach(file => {
            const matchingCert = AWS_CERTIFICATIONS.find(cert => 
                file.name.toLowerCase() === cert.expectedFileName.toLowerCase()
            );

            if (matchingCert) {
                newUploadedImages[matchingCert.code] = {
                    file,
                    isOfficialBadge: true
                };
            } else {
                const userCert = AWS_CERTIFICATIONS.find(cert => 
                    file.name.toLowerCase().includes(cert.code.toLowerCase())
                );

                if (userCert) {
                    newUploadedImages[userCert.code] = {
                        file,
                        isOfficialBadge: false
                    };
                }
            }
        });

        setUploadedImages(prev => ({
            ...prev,
            ...newUploadedImages
        }));
    };

    const handleBadgeSelect = (index: number, value: string) => {
        if (value === '' || uploadedImages[value]) {
            const newSelectedBadges = [...selectedBadges];
            newSelectedBadges[index] = value;
            setSelectedBadges(newSelectedBadges);
        } else {
            alert(`${value}の資格画像をアップロードしてください`);
        }
    };

    const clearAllBadges = () => {
        setSelectedBadges(Array(24).fill(''));
        setGeneratedImage(null);
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const generateBadgeImage = async () => {
        if (!canvasRef.current) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const badgeEdge = 200;
        const margin = 15;
    
        // Calculate the required canvas size based on the positions of the badges
        const positions = getPositions(4, 6, badgeEdge, margin);
        setPositions(positions); // 計算された位置を状態に保存
    
        // Determine the maximum width and height needed for the canvas based on selected badges
        let maxWidth = 0;
        let maxHeight = 0;
        selectedBadges.forEach((code, index) => {
            if (code !== '') {
                const position = positions[index];
                if (position.w + badgeEdge > maxWidth) maxWidth = position.w + badgeEdge;
                if (position.h + badgeEdge > maxHeight) maxHeight = position.h + badgeEdge;
            }
        });
    
        // Set the canvas size to fit all badges without extra space
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        const imagesToPlace = selectedBadges.filter(code => code !== '');
    
        const loadImage = (file: File): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            });
        };
    
        try {
            const imagePromises = imagesToPlace.map(code => loadImage(uploadedImages[code].file));
            const images = await Promise.all(imagePromises);
    
            selectedBadges.forEach((code, index) => {
                if (code !== '') {
                    const imgIndex = imagesToPlace.indexOf(code);
                    if (imgIndex !== -1) {
                        const position = positions[index];
                        ctx.drawImage(images[imgIndex], position.w, position.h, badgeEdge, badgeEdge);
                    }
                }
            });
    
            setGeneratedImage(canvas.toDataURL('image/png'));
    
        } catch (error) {
            console.error('画像の読み込みに失敗しました', error);
        }
    };
    

    function getPositions(nrows: number, ncols: number, badgeEdge: number, margin: number = 0): Point2D[] { 
        const positions: Point2D[] = []; 
        const hexHeight = Math.sqrt(3) * badgeEdge / 2;
        const hexWidth = badgeEdge; 
        const verticalSpacing = 3 / 4 * hexHeight + margin; 
        const horizontalSpacing = hexWidth * 3 / 4 + margin; 

        for (let rowNo = 0; rowNo < nrows; rowNo++) { 
            for (let colNo = 0; colNo < ncols; colNo++) {
                const xOffset = (rowNo % 2 === 0) ? 0 : horizontalSpacing / 2; 
                const x = colNo * horizontalSpacing + xOffset; 
                const y = rowNo * verticalSpacing; 
                positions.push({ h: y, w: x });
            }
        } 
        return positions; 
    }

    const availableCertifications = Object.keys(uploadedImages).filter(code => !selectedBadges.includes(code));

    return (
        <DndProvider backend={HTML5Backend}>
            <Card sx={{ width: '100%', maxWidth: 1200, margin: 'auto' }}>
                <CardHeader title="AWS認定バッジ アライナー" />
                <CardContent>
                    <TextField
                        fullWidth
                        type="file"
                        inputProps={{ 
                            multiple: true, 
                            accept: '.png' 
                        }}
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        sx={{ mb: 2 }}
                        label="AWS認定バッジ画像をアップロード"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TableContainer component={Paper} sx={{ mb: 2, borderRadius: '8px', border: '1px solid #ccc' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} sx={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', borderRadius: '8px 8px 0 0', textAlign: 'left' }}>
                                        アップロードされたバッジ
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontSize: '0.9rem', fontWeight: 'bold', borderRight: '1px solid #ccc' }}>資格名</TableCell>
                                    <TableCell sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>ファイル名</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(uploadedImages).map((code, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ fontSize: '0.9rem', borderRight: '1px solid #ccc' }}>{code}</TableCell>
                                        <TableCell sx={{ fontSize: '0.9rem' }}>{uploadedImages[code].file.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button 
                        size='small'
                        variant="contained"
                        color='inherit'
                        onClick={clearAllBadges}
                        sx={{ mt: 2, mb: 2 }}
                    >
                        選択をすべてクリア
                    </Button>

                    <Grid container spacing={2}>
                        {[...Array(24)].map((_, index) => (
                            <Grid item xs={2} key={index}>
                                <Select
                                    fullWidth
                                    value={selectedBadges[index]}
                                    onChange={(e: SelectChangeEvent<string>) => 
                                        handleBadgeSelect(index, e.target.value)
                                    }
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (selected === '') {
                                            return <em>クリア</em>;
                                        }
                                        return selected;
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>クリア</em>
                                    </MenuItem>
                                    {availableCertifications.map(code => (
                                        <MenuItem key={code} value={code}>
                                            {code}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                        ))}
                    </Grid>

                    <Button 
                        fullWidth
                        variant="contained" 
                        color="primary" 
                        onClick={generateBadgeImage}
                        disabled={selectedBadges.filter(badge => badge !== '').length === 0}
                        sx={{ mt: 2, mb: 2 }}
                    >
                        バッジ画像を生成
                    </Button>



                    {generatedImage && (
                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    生成されたバッジ
                                </Typography>
                                <img 
                                    src={generatedImage} 
                                    alt="Generated Badge" 
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    sx={{ mt: 2 }}
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = generatedImage;
                                        link.download = 'aws-badges.png';
                                        link.click();
                                    }}
                                >
                                    ダウンロード
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <canvas 
                        ref={canvasRef} 
                        style={{ display: 'none' }}
                    />
                </CardContent>
            </Card>
        </DndProvider>
    );
};

export default AWSSertificationBadgeAligner;