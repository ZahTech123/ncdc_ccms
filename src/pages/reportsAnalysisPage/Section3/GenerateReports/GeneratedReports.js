import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FaFileAlt, FaDownload } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl'; 

const GeneratedReports = ({ tickets = [], map = null }) => {
  const [reports, setReports] = useState([]);
  const [newReportId, setNewReportId] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const splitTextToLines = (text, maxWidth, fontSize, font) => {
    if (!text) return [''];
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleGenerateReport = async () => {
    const currentDate = new Date().toLocaleDateString();
    const newId = Date.now();

    setIsCapturing(true);
    setReports(prev => [{ date: currentDate, id: newId }, ...prev]);
    setNewReportId(newId);
    
    try {
      // Enhanced map readiness check
      if (map) {
        // If map has loading state, wait for it
        if (typeof map.once === 'function') {
          await new Promise((resolve) => {
            if (map.loaded()) {
              resolve();
            } else {
              map.once('idle', resolve);
              setTimeout(resolve, 1500); // Longer timeout for slow connections
            }
          });
        }
        
        // Small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await generatePdf(currentDate, tickets, map);
    } catch (error) {
      console.error('Report generation failed:', error);
      // Optionally add user feedback here
    } finally {
      setIsCapturing(false);
      setTimeout(() => setNewReportId(null), 3000);
    }
  };

  const generatePdf = async (date, tickets, mapInstance) => {
    const pdfDoc = await PDFDocument.create();
    const interFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const interBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    
    const margin = 50;
    let yPosition = height - margin;
    
    const colors = {
      white: rgb(1, 1, 1),
      black: rgb(0, 0, 0),
      gray: rgb(0.9, 0.9, 0.9),
      darkGray: rgb(0.5, 0.5, 0.5),
      lightGray: rgb(0.95, 0.95, 0.95),
      blue: rgb(0.2, 0.4, 0.8)
    };

    // Logo embedding
    let logoImage;
    try {
      const logoResponse = await fetch('https://i.ibb.co/SD97QrHS/NCDC-Logo.png');
      const logoImageBytes = await logoResponse.arrayBuffer();
      logoImage = await pdfDoc.embedPng(logoImageBytes);
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    const drawHeader = () => {
      if (logoImage) {
        page.drawImage(logoImage, {
          x: margin,
          y: yPosition - 60,
          width: 60,
          height: 60
        });
      }

      page.drawText('NCDC CCMS Complaint Report', {
        x: margin + (logoImage ? 70 : 0),
        y: yPosition - 30,
        size: 16,
        font: interBoldFont,
        color: colors.black
      });

      page.drawText(date, {
        x: width - margin - 100,
        y: yPosition - 30,
        size: 12,
        font: interFont,
        color: colors.darkGray
      });

      yPosition -= 80;
    };

    const drawFooter = (pageNumber, totalPages) => {
      const footerY = 30;
      
      page.drawText('Keep Port Moresby Clean, Safe, Healthy and Planned | Together we can', {
        x: margin,
        y: footerY,
        size: 10,
        font: interFont,
        color: colors.darkGray
      });
      
      page.drawText(`Page ${pageNumber} of ${totalPages}`, {
        x: width - margin - 50,
        y: footerY,
        size: 10,
        font: interFont,
        color: colors.darkGray
      });
    };

    const addNewPage = () => {
      const newPage = pdfDoc.addPage([595, 842]);
      page = newPage;
      yPosition = height - margin;
      drawHeader();
      return newPage;
    };

    const drawMapSection = async () => {
      const captureTimeout = 5000; // 5 second timeout
      const maxImageWidth = 400;
      const maxImageHeight = 300;
    
      console.log('Starting map section capture process');
    
      try {
        // Validate map instance
        console.log('Checking map instance validity');
        if (!map) {
          console.warn('Map is null or undefined');
          return null;
        }
    
        if (typeof map.getCanvas !== 'function') {
          console.warn('Map does not have getCanvas method');
          return null;
        }
    
        // Logging map properties
        console.log('Map instance checks:', {
          loaded: map.loaded(),
          canvas: !!map.getCanvas(),
          center: map.getCenter && map.getCenter(),
          zoom: map.getZoom && map.getZoom()
        });
    
        // Improved loading check with multiple strategies
        const mapLoadPromise = new Promise((resolve, reject) => {
          console.log('Creating map load promise');
    
          // Strategy 1: Direct loaded() check
          if (map.loaded()) {
            console.log('Map already loaded via direct check');
            resolve();
            return;
          }
    
          // Strategy 2: Event-based loading
          const loadHandler = () => {
            console.log('Map load/idle event triggered');
            clearTimeout(loadTimeoutId);
            map.off('load', loadHandler);
            map.off('idle', loadHandler);
            resolve();
          };
    
          const loadTimeoutId = setTimeout(() => {
            console.warn('Map loading timed out');
            map.off('load', loadHandler);
            map.off('idle', loadHandler);
            
            // Force resolve with a fallback mechanism
            resolve();
          }, captureTimeout);
    
          console.log('Attaching load and idle event listeners');
          map.on('load', loadHandler);
          map.on('idle', loadHandler);
        });
    
        // Wait for map to load with timeout
        console.log('Waiting for map to load');
        await Promise.race([
          mapLoadPromise,
          new Promise((_, reject) => 
            setTimeout(() => {
              console.warn('Map load race timeout');
              reject(new Error('Map load timeout'));
            }, captureTimeout)
          )
        ]);
    
        // Capture methods array with improved error handling
        const capturePromises = [
          // Method 1: Static Map API Capture
          (async () => {
            console.log('Attempting Static Map API Capture');
            if (mapboxgl.accessToken && map.getCenter && map.getZoom) {
              try {
                const center = map.getCenter();
                const zoom = map.getZoom();
                console.log('Static Map Capture Parameters:', { center, zoom });
    
                const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${center.lng},${center.lat},${zoom},0/${maxImageWidth}x${maxImageHeight}?access_token=${mapboxgl.accessToken}`;
                console.log('Static Map URL:', staticMapUrl);
                
                const staticMapResponse = await fetch(staticMapUrl);
                if (staticMapResponse.ok) {
                  console.log('Static Map Response OK');
                  const staticMapBytes = await staticMapResponse.arrayBuffer();
                  return await pdfDoc.embedPng(staticMapBytes);
                } else {
                  console.warn('Static Map Response Not OK:', staticMapResponse.status);
                }
              } catch (staticMapError) {
                console.warn('Static map capture failed:', staticMapError);
              }
            } else {
              console.warn('Static Map Capture conditions not met');
            }
            return null;
          })(),
    
          // Method 2: Canvas Capture (Improved)
          (async () => {
            console.log('Attempting Canvas Capture');
            if (map.getCanvas) {
              try {
                const mapCanvas = map.getCanvas();
                console.log('Map Canvas:', {
                  exists: !!mapCanvas,
                  width: mapCanvas?.width,
                  height: mapCanvas?.height
                });
    
                if (mapCanvas && mapCanvas.width > 0) {
                  // Force repaint and ensure map is rendered
                  console.log('Triggering map repaint');
                  map.triggerRepaint();
                  await new Promise(resolve => setTimeout(resolve, 500));
    
                  // Create a scaled-down version of the canvas to manage file size
                  const tempCanvas = document.createElement('canvas');
                  const scale = Math.min(
                    maxImageWidth / mapCanvas.width, 
                    maxImageHeight / mapCanvas.height
                  );
                  
                  tempCanvas.width = mapCanvas.width * scale;
                  tempCanvas.height = mapCanvas.height * scale;
                  
                  console.log('Temp Canvas Dimensions:', {
                    width: tempCanvas.width,
                    height: tempCanvas.height,
                    scale: scale
                  });
                  
                  const tempContext = tempCanvas.getContext('2d');
                  tempContext.drawImage(
                    mapCanvas, 
                    0, 0, 
                    mapCanvas.width, mapCanvas.height, 
                    0, 0, 
                    tempCanvas.width, tempCanvas.height
                  );
    
                  const canvasDataUrl = tempCanvas.toDataURL('image/png');
                  console.log('Canvas Data URL Length:', canvasDataUrl.length);
    
                  const mapImageResponse = await fetch(canvasDataUrl);
                  const mapImageBytes = await mapImageResponse.arrayBuffer();
                  console.log('Map Image Bytes Length:', mapImageBytes.byteLength);
    
                  return await pdfDoc.embedPng(mapImageBytes);
                }
              } catch (canvasError) {
                console.warn('Canvas capture method failed:', canvasError);
              }
            } else {
              console.warn('Canvas capture method not available');
            }
            return null;
          })()
        ];
    
        // Race capture methods with timeout
        console.log('Racing capture methods');
        const capturedImage = await Promise.race([
          Promise.any(capturePromises),
          new Promise((_, reject) => 
            setTimeout(() => {
              console.warn('Capture methods race timeout');
              reject(new Error('Map capture timeout'));
            }, captureTimeout)
          )
        ]);
    
        // Draw captured map image if available
        if (capturedImage) {
          console.log('Captured image successfully');
          page.drawImage(capturedImage, {
            x: margin,
            y: yPosition - 200,
            width: maxImageWidth,
            height: maxImageHeight
          });
          yPosition -= 220; // Adjust vertical position
        } else {
          console.warn('No map image could be captured');
        }
    
      } catch (error) {
        console.error('Complete map capture failure:', error);
      }
    
      console.log('Map section capture process completed');
    };
    
    const drawOverview = () => {
      const totalTickets = tickets.length;
      const statusCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {});

      const issueTypeCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.issueType] = (acc[ticket.issueType] || 0) + 1;
        return acc;
      }, {});

      const overviewItems = [
        { label: 'Overall Escalations', value: statusCounts['Escalated'] || 0 },
        { label: 'Assigned Tickets', value: statusCounts['Assigned'] || 0 },
        { label: 'Frequent Complaint Category', value: Object.keys(issueTypeCounts)[0] || 'N/A' },
        { label: 'Total Resolutions', value: statusCounts['Resolved'] || 0 }
      ];

      if (yPosition < margin + 150) {
        addNewPage();
      }

      const totalTicketsCardWidth = 200;
      page.drawRectangle({
        x: margin,
        y: yPosition - 70,
        width: totalTicketsCardWidth,
        height: 70,
        color: rgb(1, 0.9, 0.6),
        borderColor: rgb(0.9, 0.8, 0.4),
        borderWidth: 1,
        borderRadius: 8,
      });

      page.drawText('Total Tickets', {
        x: margin + 15,
        y: yPosition - 20,
        size: 12,
        font: interBoldFont,
        color: colors.black
      });

      page.drawText(String(totalTickets), {
        x: margin + 15,
        y: yPosition - 50,
        size: 24,
        font: interBoldFont,
        color: colors.black
      });

      yPosition -= 90;

      const cardWidth = (width - 2 * margin - 30) / 4;
      let xPosition = margin;

      overviewItems.forEach((item) => {
        page.drawRectangle({
          x: xPosition,
          y: yPosition - 70,
          width: cardWidth,
          height: 70,
          color: colors.white,
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 1,
          borderRadius: 8,
        });

        const labelLines = splitTextToLines(item.label, cardWidth - 20, 10, interBoldFont);
        
        labelLines.forEach((line, i) => {
          page.drawText(line, {
            x: xPosition + 10,
            y: yPosition - 20 + (i * -12),
            size: 10,
            font: interBoldFont,
            color: colors.black
          });
        });

        page.drawText(String(item.value), {
          x: xPosition + 10,
          y: yPosition - 50,
          size: 16,
          font: interBoldFont,
          color: colors.blue
        });

        xPosition += cardWidth + 10;
      });

      yPosition -= 90;
    };

    const drawTable = (title, headers, data) => {
      if (yPosition < margin + 150) {
        addNewPage();
      }

      page.drawText(title, {
        x: margin,
        y: yPosition - 20,
        size: 14,
        font: interBoldFont,
        color: colors.black
      });
      yPosition -= 30;

      const columnWidth = (width - 2 * margin) / headers.length;
      let xPos = margin;

      headers.forEach((header, i) => {
        page.drawRectangle({
          x: xPos,
          y: yPosition - 20,
          width: columnWidth,
          height: 20,
          color: rgb(0.95, 0.95, 0.95),
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 1,
        });

        page.drawText(header, {
          x: xPos + 5,
          y: yPosition - 15,
          size: 10,
          font: interBoldFont,
          color: colors.black
        });

        xPos += columnWidth;
      });

      yPosition -= 20;

      data.forEach((row, rowIndex) => {
        if (yPosition < margin + 20) {
          addNewPage();
          xPos = margin;
          headers.forEach((header, i) => {
            page.drawRectangle({
              x: xPos,
              y: yPosition - 20,
              width: columnWidth,
              height: 20,
              color: rgb(0.95, 0.95, 0.95),
              borderColor: rgb(0.9, 0.9, 0.9),
              borderWidth: 1,
            });

            page.drawText(header, {
              x: xPos + 5,
              y: yPosition - 15,
              size: 10,
              font: interBoldFont,
              color: colors.black
            });

            xPos += columnWidth;
          });
          yPosition -= 20;
        }

        xPos = margin;
        const rowColor = rowIndex % 2 === 0 ? colors.white : colors.lightGray;

        headers.forEach((_, colIndex) => {
          page.drawRectangle({
            x: xPos,
            y: yPosition - 20,
            width: columnWidth,
            height: 20,
            color: rowColor,
            borderColor: rgb(0.9, 0.9, 0.9),
            borderWidth: 1,
          });

          page.drawText(String(row[colIndex]), {
            x: xPos + 5,
            y: yPosition - 15,
            size: 10,
            font: interFont,
            color: colors.black
          });

          xPos += columnWidth;
        });

        yPosition -= 20;
      });

      yPosition -= 20;
    };

    // Generate data for tables
    const totalTickets = tickets.length;
    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    const issueTypeCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.issueType] = (acc[ticket.issueType] || 0) + 1;
      return acc;
    }, {});

    const electorateCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.electorate] = (acc[ticket.electorate] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => [
      status,
      count,
      `${((count / totalTickets) * 100).toFixed(1)}%`
    ]);

    const issueTypeData = Object.entries(issueTypeCounts).map(([type, count]) => [
      type,
      `${((count / totalTickets) * 100).toFixed(1)}%`
    ]);

    const electorateData = Object.entries(electorateCounts).map(([electorate, count]) => [
      electorate,
      count
    ]);

    // Draw all sections
    drawHeader();
    await drawMapSection();  // New map section
    drawOverview();
    drawTable('Status Break Down', ['Status', 'Count', 'Percentage'], statusData);
    drawTable('Issue Type Breakdown', ['Issue Type', 'Percentage'], issueTypeData);
    drawTable('Ticket Trends by Electorate', ['Electorate', 'Count'], electorateData);

    // Add footer to each page
    const pages = pdfDoc.getPages();
    pages.forEach((currentPage, index) => {
      page = currentPage;
      drawFooter(index + 1, pages.length);
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NCDC_Complaint_Report_${date.replace(/\//g, '-')}.pdf`;
    link.click();
  };

  return (
    <div className="lg:w-1/4 bg-gray-800 p-6 rounded-lg h-full">
      <div className="bg-gray-800 text-white w-full rounded-lg flex flex-col h-full">
        <h2 className="text-lg font-bold mb-4 text-center">GENERATED REPORTS</h2>
        <div className="flex-grow space-y-3 overflow-y-auto">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className={`flex flex-col items-center gap-3 mb-4 transition-all duration-300 ${
                newReportId === report.id ? 'scale-105' : ''
              }`}
            >
              <button
                onClick={() => generatePdf(report.date, tickets, map)}
                className="group relative mb-1 hover:opacity-80 transition-opacity cursor-pointer"
                disabled={isCapturing}
              >
                <FaFileAlt className={`text-2xl ${
                  newReportId === report.id ? 'text-yellow-300' : 'text-yellow-500'
                }`} />
                <FaDownload className="text-yellow-500 text-xs absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform" />
              </button>
              <p className={`text-sm ${
                newReportId === report.id ? 'text-yellow-300 font-medium' : 'text-gray-300'
              }`}>
                {report.date}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6">
          <button
            onClick={handleGenerateReport}
            className={`bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg w-full hover:bg-yellow-600 transition ${
              isCapturing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                GENERATING...
              </span>
            ) : 'GENERATE REPORT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedReports;