const xml2js = require('xml2js');

const parseXMLReport = async (xmlContent) => {
    try {
        const parser = new xml2js.Parser({ 
            explicitArray: false,
            trim: true,
            explicitRoot: true,
            mergeAttrs: true
        });

        const result = await parser.parseStringPromise(xmlContent);
        const report = result.INProfileResponse;

        // Extract basic details
        const basicDetails = {
            name: `${report.Current_Application?.Current_Application_Details?.Current_Applicant_Details?.First_Name || ''} ${report.Current_Application?.Current_Application_Details?.Current_Applicant_Details?.Last_Name || ''}`.trim(),
            pan: report.Current_Application?.Current_Application_Details?.Current_Applicant_Details?.IncomeTaxPan || '',
            dob: report.Current_Application?.Current_Application_Details?.Current_Applicant_Details?.Date_Of_Birth_Applicant || '',
            phone: report.Current_Application?.Current_Application_Details?.Current_Applicant_Details?.MobilePhoneNumber || '',
            creditScore: report.SCORE?.BureauScore || ''
        };

        // Extract account summary
        const caisSummary = report.CAIS_Account?.CAIS_Summary;
        const accountSummary = {
            totalAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountTotal || '0'),
            activeAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountActive || '0'),
            closedAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountClosed || '0'),
            defaultAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountDefault || '0'),
            totalBalance: {
                secured: parseInt(caisSummary?.Total_Outstanding_Balance?.Outstanding_Balance_Secured || '0'),
                unsecured: parseInt(caisSummary?.Total_Outstanding_Balance?.Outstanding_Balance_UnSecured || '0'),
                total: parseInt(caisSummary?.Total_Outstanding_Balance?.Outstanding_Balance_All || '0')
            }
        };

        // Extract credit accounts
        const accounts = Array.isArray(report.CAIS_Account?.CAIS_Account_DETAILS) 
            ? report.CAIS_Account.CAIS_Account_DETAILS 
            : [report.CAIS_Account?.CAIS_Account_DETAILS].filter(Boolean);

        const creditAccounts = accounts.map(account => {
            const history = Array.isArray(account.CAIS_Account_History) 
                ? account.CAIS_Account_History 
                : [account.CAIS_Account_History].filter(Boolean);

            return {
                accountNumber: account.Account_Number || '',
                bank: (account.Subscriber_Name || '').trim(),
                accountType: account.Account_Type || '',
                openDate: account.Open_Date || '',
                status: account.Account_Status || '',
                creditLimit: parseInt(account.Credit_Limit_Amount || '0'),
                currentBalance: parseInt(account.Current_Balance || '0'),
                amountOverdue: parseInt(account.Amount_Past_Due || '0'),
                paymentHistory: account.Payment_History_Profile || '',
                paymentHistoryDetails: history.map(h => ({
                    year: h.Year || '',
                    month: h.Month || '',
                    daysOverdue: parseInt(h.Days_Past_Due || '0')
                }))
            };
        });

        console.log('Extracted Data:', {
            basicDetails,
            accountSummary,
            creditAccounts: creditAccounts.length
        });

        return {
            basicDetails,
            accountSummary,
            creditAccounts
        };
    } catch (error) {
        console.error('XML Parsing error:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`Failed to parse XML: ${error.message}`);
    }
};

module.exports = {
    parseXMLReport
};
