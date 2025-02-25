import React from 'react';
import PropTypes from 'prop-types';
import useEditor from '../../../../hooks/useEditor';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SizeInputs from './inputs/SizeInputs';
import ImageToUpload from './image/ImageToUpload';

function UploadDialog({ open, onClose, onSubmit, uploadCallback }) {
    const editor = useEditor();
    const [imageURL, setImageURL] = React.useState('');
    const [imageWidth, setImageWidth] = React.useState(0);
    const [imageOriginalWidth, setImageOriginalWidth] = React.useState(0);
    const [imageHeight, setImageHeight] = React.useState(0);
    const [imageOriginalHeight, setImageOriginalHeight] = React.useState(0);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isValidImage, setIsValidImage] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState(null);
    const [highlightDropArea, setHighlightDropArea] = React.useState(false);
    const inputFileRef = React.createRef();

    const handleSubmit = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        onSubmit({ imageURL, imageWidth, imageHeight });
    };

    const handleClickDropArea = (ev) => {
        ev.preventDefault();
        inputFileRef.current.click();
    };

    const handleDragEnter = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setHighlightDropArea(true);
    };

    const handleDragLeave = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setHighlightDropArea(false);
    };

    const handleDragOver = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setHighlightDropArea(true);
    };

    const handleDrop = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const files = ev.dataTransfer.files;
        if (files.length > 0) await onSelectFile(files[0]);
    };

    const handleInputFileChange = async () => {
        const files = inputFileRef.current.files;
        if (files.length > 0) await onSelectFile(files[0]);
    };

    const onSelectFile = async (file) => {
        setHighlightDropArea(false);
        setIsUploading(true);
        try {
            const selectedImageUrl = await uploadCallback(file);
            setImageURL(selectedImageUrl);
            const image = new Image();
            image.onload = function () {
                setImageWidth(this.width);
                setImageOriginalWidth(this.width);
                setImageHeight(this.height);
                setImageOriginalHeight(this.height);
                setIsUploading(false);
                setIsValidImage(true);
                setHasError(false);
            };
            image.onerror = function () {
                setIsUploading(false);
                setIsValidImage(false);
                setHasError(true);
                setErrorMessage(null);
            };
            image.src = selectedImageUrl;
        } catch (e) {
            setIsUploading(false);
            setIsValidImage(false);
            setHasError(true);
            setErrorMessage(e);
        }
    };

    const resetForm = () => {
        setImageURL('');
        setIsValidImage(false);
        setIsUploading(false);
        setHighlightDropArea(false);
    };

    let dropAreaContent = (
        <Typography variant="subtitle1">
            {editor.translate('controls.image.labels.dropImageHere')}
        </Typography>
    );

    if (isUploading) {
        dropAreaContent = <CircularProgress />;
    } else if (isValidImage && imageURL) {
        dropAreaContent = <ImageToUpload src={imageURL} height={imageHeight} width={imageWidth} />;
    }

    return (
        <Dialog open={open} onClose={onClose} onEnter={resetForm}>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <input
                        ref={inputFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleInputFileChange}
                        style={{ display: 'none' }}
                    />
                    {isValidImage && imageURL !== '' && (
                        <SizeInputs
                            originalWidth={imageOriginalWidth}
                            originalHeight={imageOriginalHeight}
                            width={imageWidth}
                            height={imageHeight}
                            onChangeWidth={setImageWidth}
                            onChangeHeight={setImageHeight}
                        />
                    )}

                    {hasError && !isValidImage && (
                        <Typography variant="subtitle1" color="error" align="center" gutterBottom>
                            {errorMessage !== null
                                ? errorMessage
                                : editor.translate('controls.image.errorMessages.notValidImage')}
                        </Typography>
                    )}

                    <div
                        style={{
                            width: 500,
                            height: 300,
                            boxSizing: 'border-box',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: (theme) => theme.spacing(2),
                            marginTop: (theme) => theme.spacing(1),
                            marginBottom: (theme) => theme.spacing(2),
                            borderRadius: (theme) => theme.shape.borderRadius || 4,
                            backgroundColor: highlightDropArea
                                ? (theme) => theme.palette.grey[400] || '#bdbdbd'
                                : (theme) => theme.palette.grey[200] || '#eeeeee',
                            border: highlightDropArea
                                ? `solid 3px ${(theme) => theme.palette.grey[600] || '#757575'}`
                                : `dashed 3px ${(theme) => theme.palette.grey[400] || '#bdbdbd'}`,
                            color: (theme) => theme.palette.text.hint || 'rgba(0, 0, 0, 0.38)',
                            cursor: 'pointer',
                        }}
                        onClick={handleClickDropArea}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}>
                        {dropAreaContent}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button type="button" onClick={onClose} color="primary">
                        {editor.translate('controls.image.actions.cancel')}
                    </Button>
                    <Button type="submit" color="primary" disabled={!isValidImage}>
                        {editor.translate('controls.image.actions.add')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

UploadDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    uploadCallback: PropTypes.func.isRequired,
};

export default UploadDialog;
