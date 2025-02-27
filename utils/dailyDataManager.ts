import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyData {
  date: string;
  transactions: Transaction[];
  dailyBalance: number;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

export const DailyDataManager = {
  async initializeDay() {
    const today = new Date().toISOString().split('T')[0];
    const currentDayData = await this.getCurrentDayData();
    
    if (currentDayData?.date !== today) {
      // Yeni gün başlangıcı
      const newDayData: DailyData = {
        date: today,
        transactions: [],
        dailyBalance: 0
      };
      
      // Önceki günün verilerini arşivle
      if (currentDayData) {
        await this.archivePreviousDay(currentDayData);
      }
      
      // Yeni günü başlat
      await AsyncStorage.setItem('currentDayData', JSON.stringify(newDayData));
      return newDayData;
    }
    
    return currentDayData;
  },

  async getCurrentDayData(): Promise<DailyData | null> {
    const data = await AsyncStorage.getItem('currentDayData');
    return data ? JSON.parse(data) : null;
  },

  async archivePreviousDay(dayData: DailyData) {
    const archiveKey = `archived_${dayData.date}`;
    await AsyncStorage.setItem(archiveKey, JSON.stringify(dayData));
    
    // Arşiv listesini güncelle
    const archiveList = await this.getArchiveList();
    archiveList.unshift(dayData.date);
    await AsyncStorage.setItem('archiveList', JSON.stringify(archiveList));
  },

  async getArchiveList(): Promise<string[]> {
    const list = await AsyncStorage.getItem('archiveList');
    return list ? JSON.parse(list) : [];
  },

  async addTransaction(transaction: Transaction) {
    const currentDay = await this.getCurrentDayData();
    if (!currentDay) return;

    const updatedData = {
      ...currentDay,
      transactions: [...currentDay.transactions, transaction],
      dailyBalance: currentDay.dailyBalance + 
        (transaction.type === 'income' ? transaction.amount : -transaction.amount)
    };

    await AsyncStorage.setItem('currentDayData', JSON.stringify(updatedData));
    return updatedData;
  },

  async getArchivedDay(date: string): Promise<DailyData | null> {
    const data = await AsyncStorage.getItem(`archived_${date}`);
    return data ? JSON.parse(data) : null;
  },

  async getAllTimeBalance(): Promise<number> {
    const archiveList = await this.getArchiveList();
    let total = 0;

    // Arşivlenmiş günlerin bakiyelerini topla
    for (const date of archiveList) {
      const dayData = await this.getArchivedDay(date);
      if (dayData) {
        total += dayData.dailyBalance;
      }
    }

    // Mevcut günün bakiyesini ekle
    const currentDay = await this.getCurrentDayData();
    if (currentDay) {
      total += currentDay.dailyBalance;
    }

    return total;
  }
};
