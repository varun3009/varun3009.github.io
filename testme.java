import java.io.*;
import java.util.*;
import javax.swing.*;
import javax.swing.border.BevelBorder;
import javax.swing.border.Border;
import javax.swing.plaf.ColorUIResource;
import javax.swing.plaf.FontUIResource;
import javax.swing.table.DefaultTableModel;

import javax.swing.table.*;
import java.awt.event.*;
import java.awt.*;

class Node implements Serializable {
    Node next = null;
    String name, gmail, job_title;
    Long phno;

    public void serial1(Node n, FileOutputStream fos, ObjectOutputStream obj) throws Exception {
        obj.writeObject(n);
    }
}

class internserial implements Serializable {

    public Node head;

    public void serial(internserial is) {

        try {
            FileOutputStream fos = new FileOutputStream("./obj.txt");
            ObjectOutputStream obj = new ObjectOutputStream(fos);
            obj.writeObject(is);
            // is.head.serial1(is.head, fos, obj);
            System.out.println("serial");
            fos.close();
            obj.close();
        } catch (Exception e) {
        }
    }

}

public class testme {
    public static internserial gis = new internserial();
    static Scanner sc = new Scanner(System.in);
    static JFrame frame;
    static ImageIcon viewi, searchi, deletei, addi;

    public static void add() {
        JDialog db = new JDialog(frame, "add");
        try {
            JLabel name = new JLabel("Name:");
            JLabel ph = new JLabel("ph no:");
            JLabel gmail1 = new JLabel("GMail:");
            JLabel job1 = new JLabel("Job Title:");
            db.setLayout(new GridBagLayout());
            GridBagConstraints gbc = new GridBagConstraints();
            JTextField tf1 = new JTextField(15);
            JTextField tf2 = new JTextField(15);
            JTextField tf3 = new JTextField(15);
            JTextField tf4 = new JTextField(15);
            JButton b1 = new JButton("submit");
            gbc.insets = new Insets(5, 15, 5, 30);
            b1.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    try {
                        String ph = tf1.getText();
                        ph = ph.trim();
                        String name = tf2.getText();
                        name = name.trim();

                        if (ph.length() == 10 && name.length() > 0) {
                            Node n = new Node();
                            n.phno = Long.parseLong(ph);
                            n.name = name;
                            if (tf3.getText() != null) {
                                String str1 = tf3.getText();
                                str1 = str1.trim();
                                if (str1.length() > 0)
                                    n.gmail = str1;
                            }
                            if (tf4.getText() != null) {
                                String str1 = tf4.getText();
                                str1 = str1.trim();
                                if (str1.length() > 0)
                                    n.job_title = str1;
                            }
                            Node temp = gis.head;
                            if (temp == null)
                                gis.head = n;
                            else {
                                while (temp.next != null) {
                                    temp = temp.next;
                                }
                                temp.next = n;
                            }
                            gis.serial(gis);
                            deserial();
                        } else {
                            throw new ArithmeticException("gdr");
                        }
                    } catch (Exception eu) {
                        JOptionPane.showMessageDialog(db, "invalid number");
                    }
                }
            });
            db.add(ph, gbc);
            gbc.gridx = 1;
            db.add(tf1, gbc);
            gbc.gridy = 1;
            gbc.gridx = 0;
            db.add(name, gbc);
            gbc.gridx = 1;
            db.add(tf2, gbc);
            gbc.gridy = 2;
            gbc.gridx = 0;
            db.add(gmail1, gbc);
            gbc.gridx = 1;
            db.add(tf3, gbc);
            gbc.gridy = 3;
            gbc.gridx = 0;
            db.add(job1, gbc);
            gbc.gridx = 1;
            db.add(tf4, gbc);
            gbc.gridy = 4;
            db.add(b1, gbc);
            db.setVisible(true);
            db.setSize(400, 400);

        } catch (ArithmeticException e) {
            System.out.println("hui");
            JOptionPane.showMessageDialog(db, "invalid number");
        }
    }

    public static boolean comparestr(String s1, String s2) {
        return s1.contains(s2);
    }

    public static void mainf() throws Exception {
        viewi = new ImageIcon("./img/view.png");
        searchi = new ImageIcon("./img/search.png");
        deletei = new ImageIcon("./img/delete.png");
        addi = new ImageIcon("./img/add.png");
        Image img = addi.getImage();
        Image img1 = img.getScaledInstance(80, 80, Image.SCALE_SMOOTH);
        addi = new ImageIcon(img1);
        img = deletei.getImage();
        img1 = img.getScaledInstance(80, 80, Image.SCALE_SMOOTH);
        deletei = new ImageIcon(img1);
        img = searchi.getImage();
        img1 = img.getScaledInstance(80, 80, Image.SCALE_SMOOTH);
        searchi = new ImageIcon(img1);
        img = viewi.getImage();
        img1 = img.getScaledInstance(80, 80, Image.SCALE_SMOOTH);
        viewi = new ImageIcon(img1);
        frame = new JFrame("Contacts");

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.gridy = 0;
        frame.setLayout(new GridBagLayout());
        JPanel panel = new JPanel(new GridBagLayout());
        JButton view = new JButton();
        panel.setBackground(Color.black);
        frame.getContentPane().setBackground(Color.black);

        view.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                disp();
            }
        });
        view.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) {
                JButton b1 = (JButton) e.getSource();
                b1.setBackground(Color.white);
            }

            public void mouseExited(MouseEvent e) {
                JButton b = (JButton) e.getSource();
                b.setBackground(Color.black);
            }
        });

        view.setBackground(Color.black);
        JButton add = new JButton();
        add.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                add();
            }
        });
        JButton del = new JButton();
        del.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                del();
            }
        });
        JButton sear = new JButton();
        sear.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                search();
            }
        });
        del.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) {
                JButton b1 = (JButton) e.getSource();
                b1.setBackground(Color.white);
            }

            public void mouseExited(MouseEvent e) {
                JButton b = (JButton) e.getSource();
                b.setBackground(Color.black);
            }
        });
        add.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) {
                JButton b1 = (JButton) e.getSource();
                b1.setBackground(Color.white);
            }

            public void mouseExited(MouseEvent e) {
                JButton b = (JButton) e.getSource();
                b.setBackground(Color.black);
            }
        });
        sear.addMouseListener(new MouseAdapter() {
            public void mouseEntered(MouseEvent e) {
                JButton b1 = (JButton) e.getSource();
                b1.setBackground(Color.white);
            }

            public void mouseExited(MouseEvent e) {
                JButton b = (JButton) e.getSource();
                b.setBackground(Color.black);
            }
        });
        view.setIcon(viewi);
        sear.setIcon(searchi);
        del.setIcon(deletei);
        add.setIcon(addi);
        sear.setBackground(Color.black);
        del.setBackground(Color.black);
        add.setBackground(Color.black);
        sear.setBorder(null);
        del.setBorder(null);
        add.setBorder(null);
        view.setBorder(null);
        gbc.insets = new Insets(25, 40, 40, 60);
        panel.add(view, gbc);
        gbc.gridx += 1;
        panel.add(add, gbc);
        gbc.gridy = 1;
        gbc.gridx = 0;
        panel.add(del, gbc);
        gbc.gridx = 1;
        panel.add(sear, gbc);
        frame.add(panel, gbc);
        frame.setVisible(true);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocationRelativeTo(null);
        frame.setSize(300, 300);
    }

    public static void search() {

        JDialog dg = new JDialog(frame, "search");
        // String[] title = { "name", "ph no" };
        Node n = gis.head;
        JTextField tf = new JTextField(20);
        JTextArea ta = new JTextArea(10, 20);
        JButton b = new JButton("search");
        b.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                ta.setText("");
                String str = tf.getText();
                str = str.trim();
                Node n = gis.head;
                while (n != null) {
                    boolean gmailb = false, jobb = false;
                    boolean phnob = comparestr(n.phno + "", str);
                    boolean nameb = comparestr(n.name, str);
                    if (n.gmail != null)
                        gmailb = comparestr(n.gmail + "", str);
                    if (n.job_title != null)
                        jobb = comparestr(n.job_title, str);
                    if (gmailb || jobb || phnob || nameb) {
                        ta.append("ph no: " + n.phno + "\t");
                        ta.append("name: " + n.name + "\t");
                        if (n.gmail != null)
                            ta.append("gmail: " + n.gmail + "\t");
                        if (n.job_title != null)
                            ta.append("job: " + n.job_title + "\t");
                        ta.append("\n");
                    }
                    n = n.next;
                }
            }
        });

        JScrollPane jScrollPane = new JScrollPane(ta,
                JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED,
                JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);

        dg.setLayout(new GridBagLayout());

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 15, 5, 30);
        dg.add(tf, gbc);
        gbc.gridx = 1;
        dg.add(b, gbc);
        gbc.gridy = 1;
        gbc.gridx = 0;
        // dg.add(ta, gbc);
        dg.add(jScrollPane, gbc);
        dg.setVisible(true);
        dg.setSize(400, 400);

    }

    public static void disp() {

        GridBagConstraints gbc = new GridBagConstraints();
        JDialog panel = new JDialog(frame, "contacts");
        // JLabel label[][] = new JLabel[200][2];
        panel.setLayout(new GridBagLayout());
        int k = 0;
        gbc.insets = new Insets(5, 15, 5, 30);
        JTextArea ta = new JTextArea(5, 30);
        // ta.append("contacts \t numbers");
        Node temp = gis.head;
        while (temp != null) {
            ta.append("name: " + temp.name + "\t");
            ta.append("ph no: " + temp.phno + "\t");
            if (temp.job_title != null)
                ta.append("job title: " + temp.job_title + "\t");
            if (temp.gmail != null)
                ta.append("gmail: " + temp.gmail);
            ta.append("\n");
            temp = temp.next;
        }
        JScrollPane jScrollPane = new JScrollPane(ta,
                JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED,
                JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        // ta.append("\n\n\n sscs");
        // panel.add(ta);
        panel.setVisible(true);
        panel.setSize(500, 500);

        panel.add(jScrollPane);
        // frame.pack();
    }

    public static void del() {
        JDialog db = new JDialog(frame, "delete");
        try {

            db.setLayout(new GridBagLayout());
            GridBagConstraints gbc = new GridBagConstraints();
            JTextField tf1 = new JTextField(10);
            JButton b1 = new JButton("submit");
            gbc.insets = new Insets(5, 15, 5, 30);
            b1.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    String ph = tf1.getText();
                    if (ph.length() == 10) {
                        long phno = Long.parseLong(ph);
                        Node temp = gis.head;
                        Node prev = temp;
                        while (temp != null) {
                            long no = temp.phno;
                            if (no == phno)
                                break;
                            System.out.println(temp.phno + " " + phno);
                            prev = temp;
                            temp = temp.next;
                        }
                        if (temp == null) {
                            JOptionPane.showMessageDialog(db, "not found");
                            return;
                        }
                        if (temp == gis.head)
                            gis.head = gis.head.next;
                        else {
                            prev.next = temp.next;
                        }
                    } else {
                        JOptionPane.showMessageDialog(db, "not found");
                    }
                    gis.serial(gis);
                    deserial();
                }
            });
            db.add(tf1, gbc);
            gbc.gridy = 1;
            db.add(b1, gbc);

            db.setVisible(true);
            db.setSize(400, 400);

        } catch (Exception e) {
            JOptionPane.showMessageDialog(db, "Invalid");
        }
    }

    public static void main(String[] args) throws Exception {
        // gis.serial(gis);
        deserial();
        // add();
        // add();
        // del();
        // disp();
        mainf();
    }

    public static void deserial() {
        try {
            FileInputStream in = new FileInputStream("./obj.txt");
            ObjectInputStream obj = new ObjectInputStream(in);
            internserial is = (internserial) obj.readObject();
            gis = is;
            System.out.println("deserial");
            in.close();
            obj.close();
        } catch (Exception e) {
        }
    }
}
