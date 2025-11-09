"""
PDF parsing utilities for ClaimPilot AI
"""
import re
from typing import Dict, List, Optional
from datetime import datetime
import base64
import io


class PDFParser:
    """Parse PDF documents and extract relevant information"""

    def __init__(self):
        self.supported_formats = ['.pdf', '.txt']

    def parse_document(self, file_data: str, file_name: str) -> str:
        """
        Parse a document and extract text content

        Args:
            file_data: Base64 encoded file content
            file_name: Name of the file

        Returns:
            Extracted text content
        """
        try:
            # Decode base64 data
            decoded_data = base64.b64decode(file_data)

            # Check file type
            if file_name.lower().endswith('.txt'):
                return decoded_data.decode('utf-8')
            elif file_name.lower().endswith('.pdf'):
                return self._parse_pdf(decoded_data)
            else:
                raise ValueError(f"Unsupported file format: {file_name}")

        except Exception as e:
            raise Exception(f"Error parsing document: {str(e)}")

    def _parse_pdf(self, pdf_data: bytes) -> str:
        """
        Parse PDF file content
        Parse PDF file content using MCP tools

        Args:
            pdf_data: Raw PDF bytes

        Returns:
            Extracted text
        """
        try:
            # Try using PyPDF2
            import PyPDF2
            pdf_file = io.BytesIO(pdf_data)
            pdf_reader = PyPDF2.PdfReader(pdf_file)

            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

            return text.strip()
        except ImportError:
            # Fallback: try pdfplumber
            try:
                import pdfplumber
                pdf_file = io.BytesIO(pdf_data)
                text = ""
                with pdfplumber.open(pdf_file) as pdf:
                    for page in pdf.pages:
                        text += page.extract_text() + "\n"
                return text.strip()
            except ImportError:
                raise Exception("No PDF parsing library available. Install PyPDF2 or pdfplumber.")
            # Use MCP parse_pdf tool
            from utils.mcp_tools import parse_pdf_from_bytes
            return parse_pdf_from_bytes(pdf_data)
        except Exception as e:
            # Fallback to PyPDF2/pdfplumber if MCP tools fail
            try:
                import PyPDF2
                pdf_file = io.BytesIO(pdf_data)
                pdf_reader = PyPDF2.PdfReader(pdf_file)

                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"

                return text.strip()
            except ImportError:
                # Final fallback: try pdfplumber
                try:
                    import pdfplumber
                    pdf_file = io.BytesIO(pdf_data)
                    text = ""
                    with pdfplumber.open(pdf_file) as pdf:
                        for page in pdf.pages:
                            text += page.extract_text() + "\n"
                    return text.strip()
                except ImportError:
                    raise Exception("No PDF parsing library available. Install PyPDF2 or pdfplumber.")

    def extract_structured_data(self, text: str) -> Dict:
        """
        Extract structured data from raw text using regex patterns

        Args:
            text: Raw text from document

        Returns:
            Dictionary with extracted fields
        """
        data = {
            "incident_type": self._extract_incident_type(text),
            "date": self._extract_date(text),
            "location": self._extract_location(text),
            "parties": self._extract_parties(text),
            "damages": self._extract_damages(text),
            "amounts": self._extract_monetary_amounts(text),
        }

        return data

    def _extract_incident_type(self, text: str) -> Optional[str]:
        """Extract incident type from text"""
        patterns = {
            "Car Accident": r"(?i)(car accident|vehicle collision|auto accident|traffic accident|car crash)",
            "Home Damage": r"(?i)(home damage|house damage|property damage|water damage|fire damage)",
            "Theft": r"(?i)(theft|burglary|stolen|robbery)",
            "Medical": r"(?i)(medical|injury|hospital|treatment|doctor)",
        }

        for incident_type, pattern in patterns.items():
            if re.search(pattern, text):
                return incident_type

        return "Other"

    def _extract_date(self, text: str) -> Optional[str]:
        """Extract date from text"""
        # Common date patterns
        date_patterns = [
            r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",  # MM/DD/YYYY or MM-DD-YYYY
            r"\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b",    # YYYY-MM-DD
            r"\b([A-Za-z]+\s+\d{1,2},?\s+\d{4})\b",  # Month DD, YYYY
        ]

        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)

        # Default to today if not found
        return datetime.now().strftime("%Y-%m-%d")

    def _extract_location(self, text: str) -> Optional[str]:
        """Extract location from text"""
        # Look for common location patterns
        location_patterns = [
            r"(?i)(?:location|address|scene):\s*([^\n]+)",
            r"(?i)(?:at|near|on)\s+([A-Z][A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr)[^\n]*)",
            r"\b([A-Z][a-z]+,\s*[A-Z]{2})\b",  # City, STATE
        ]

        for pattern in location_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()

        return "Location not specified"

    def _extract_parties(self, text: str) -> List[Dict]:
        """Extract parties involved from text"""
        parties = []

        # Look for name patterns
        name_patterns = [
            r"(?i)driver:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)",
            r"(?i)owner:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)",
            r"(?i)claimant:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)",
        ]

        for pattern in name_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                parties.append({
                    "name": match.group(1),
                    "role": "involved party"
                })

        return parties

    def _extract_damages(self, text: str) -> str:
        """Extract damage description from text"""
        damage_keywords = [
            "damage", "broken", "dent", "scratch", "shatter", "crack",
            "injury", "harm", "collision", "impact", "destroyed"
        ]

        # Find sentences containing damage keywords
        sentences = re.split(r'[.!?]+', text)
        damage_sentences = []

        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in damage_keywords):
                damage_sentences.append(sentence.strip())

        if damage_sentences:
            return " ".join(damage_sentences[:3])  # Return first 3 relevant sentences

        return "Damage description not available"

    def _extract_monetary_amounts(self, text: str) -> List[float]:
        """Extract monetary amounts from text"""
        # Pattern for currency amounts
        pattern = r"\$\s*[\d,]+(?:\.\d{2})?"
        matches = re.findall(pattern, text)

        amounts = []
        for match in matches:
            # Remove $ and commas, convert to float
            amount_str = match.replace('$', '').replace(',', '').strip()
            try:
                amounts.append(float(amount_str))
            except ValueError:
                continue

        return amounts


# Singleton instance
pdf_parser = PDFParser()
