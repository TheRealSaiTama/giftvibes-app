'use client';

interface Product {
  description: string;
}

interface ProductSpecificationsProps {
  product: Product;
}

interface Specification {
  label: string;
  value: string;
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const parseSpecifications = (description: string): Specification[] => {
    if (!description) return [];

    const specs: Specification[] = [];
    const lines = description.split('\n');

    const specPatterns = [
      { pattern: /Size\s*:\s*(.+)/, label: 'Size' },
      { pattern: /Paper Quality\s*:\s*(.+)/, label: 'Paper Quality' },
      { pattern: /Page Format\s*:\s*(.+)/, label: 'Page Format' },
      { pattern: /Cover Binding\s*:\s*(.+)/, label: 'Cover Binding' },
      { pattern: /Monthly Planner\s*:\s*(.+)/, label: 'Monthly Planner' },
      { pattern: /Month Cutting\s*:\s*(.+)/, label: 'Month Cutting' },
      { pattern: /Cover Colours?\s*:\s*(.+)/, label: 'Cover Colors' },
      { pattern: /Paper\s*:\s*(.+)/, label: 'Paper' },
      { pattern: /Binding\s*:\s*(.+)/, label: 'Binding' },
      { pattern: /Format\s*:\s*(.+)/, label: 'Format' },
      { pattern: /Colours?\s*:\s*(.+)/, label: 'Colours' },
    ];

    for (const line of lines) {
      for (const { pattern, label } of specPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          if (!specs.some((s) => s.label === label)) {
            specs.push({ label, value });
          }
        }
      }
    }

    return specs;
  };

  const specifications = parseSpecifications(product.description);

  const parseNotes = (description: string): string[] => {
    if (!description) return [];
    const notes: string[] = [];

    if (description.includes('COD facility not available')) {
      notes.push('* COD facility not available for this product *');
    }
    if (description.includes('minimum order quantity restriction')) {
      notes.push('*This product has minimum order quantity restriction.');
    }
    if (description.includes('Pen Charges Extra')) {
      notes.push('** Pen Charges Extra');
    }
    if (description.includes('less than MOQ')) {
      notes.push('** If your order quantity is little less than MOQ then please write us.');
    }

    return notes;
  };

  const notes = parseNotes(product.description);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 space-y-8">
      {specifications.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Specifications</h2>
          <div className="divide-y divide-gray-100">
            {specifications.map((spec, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 py-4">
                <dt className="text-sm font-semibold text-gray-600">{spec.label} :</dt>
                <dd className="text-sm text-gray-900">{spec.value}</dd>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note, idx) => (
            <p key={idx} className="text-xs text-red-600 italic">
              {note}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
          <div className="w-12 h-12 bg-[#1a5f7a] text-white rounded-full flex items-center justify-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">New Year</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Customized Diary & Note Books</h3>
          <p className="text-xs text-gray-600">Perfect for corporate gifting and personal use</p>
        </div>

        <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
          <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Bulk</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Special Pricing</h3>
          <p className="text-xs text-gray-600">Contact us for bulk orders and custom designs</p>
        </div>

        <div className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
          <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Quick</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fast Shipping</h3>
          <p className="text-xs text-gray-600">Quick delivery options available across India</p>
        </div>
      </div>
    </div>
  );
}
