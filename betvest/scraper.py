from lxml import html  
import requests
from time import sleep

def parse(ticker):
	url = "http://finance.yahoo.com/quote/%s?p=%s"%(ticker,ticker)
	response = requests.get(url, verify=False)
	print ("Parsing %s"%(url))
	sleep(4)
	parser = html.fromstring(response.text)

	try:
		summary_table = parser.xpath('//div[contains(@data-test,"left-summary-table")]//tr')
		want = summary_table[0].xpath('.//td[contains(@class,"Ta(end)")]//text()')
		return float(want[0])

	except:
		print ("Failed to parse json response")
		return {"error":"Failed to parse json response"}
		
'''		
if __name__=="__main__":
	argparser = argparse.ArgumentParser()
	argparser.add_argument('ticker',help = '')
	args = argparser.parse_args()
	ticker = args.ticker
	print ("Fetching data for %s"%(ticker))
	scraped_data = parse(ticker)
	print ("Writing data to output file")
	print(scraped_data)
	print(type(scraped_data))
	#with open('%s-summary.json'%(ticker),'w') as fp:
	#	json.dump(scraped_data,fp,indent = 4)	
'''