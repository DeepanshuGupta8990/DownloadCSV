const express = require('express');
const mongoose = require('mongoose');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = 'mongodb+srv://deepanshugupta899:ZxEBEU2tZW5sI9BF@cluster0.ki6bgeh.mongodb.net/webscraper';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const scrapedDataSchema = new mongoose.Schema({
    name: String,
    description: String,
    logo: String,
    facebook: String,
    linkedin: String,
    twitter: String,
    instagram: String,
    address: String,
    phone: String,
    email: String,
    screenshot: String,
    url: String,
}, { timestamps: true });

const ScrapedData = mongoose.model('ScrapedData', scrapedDataSchema);
app.get("/",(req,res)=>{res.send("working fine")})

app.get('/downloadCSV', async (req, res) => {
    try {
        const data = await ScrapedData.find();
        if (!data.length) {
            return res.status(404).json({ error: 'No data found' });
        }

        const downloadsDir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir);
        }

        const csvWriter = createObjectCsvWriter({
            path: path.join(downloadsDir, 'scrapedData.csv'),
            header: [
                { id: 'name', title: 'Name' },
                { id: 'description', title: 'Description' },
                { id: 'logo', title: 'Logo' },
                { id: 'facebook', title: 'Facebook' },
                { id: 'linkedin', title: 'LinkedIn' },
                { id: 'twitter', title: 'Twitter' },
                { id: 'instagram', title: 'Instagram' },
                { id: 'address', title: 'Address' },
                { id: 'phone', title: 'Phone' },
                { id: 'email', title: 'Email' },
                { id: 'screenshot', title: 'Screenshot' },
                { id: 'url', title: 'URL' },
            ],
        });

        await csvWriter.writeRecords(data);

        res.download(path.join(downloadsDir, 'scrapedData.csv'), 'scrapedData.csv', (err) => {
            if (err) {
                console.error('Error downloading the file:', err);
                res.status(500).send('Could not download the file.');
            }
        });
    } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
