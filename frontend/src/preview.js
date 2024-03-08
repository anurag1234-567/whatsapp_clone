import LockIcon from '@mui/icons-material/Lock';

function Preview(){
    return(
        <div className="preview">
            <div className='content'>
                <img src='preview_image.png' alt=''/>
                <h3>Download Whatsapp for Windows</h3>
                <p>Make calls, share your screen and get a faster experience when you donwload the windows app.</p>
                <button>Get the app</button>
            </div>

            <div className='encryption-msg'>
                <LockIcon className='icon'/>
                Your personal messages are end-to-end encrypted
            </div>
        </div>
    )
}
export default Preview;